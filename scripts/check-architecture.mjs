import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

export function verificarArquitectura(rootDir = 'src') {
  const root = path.resolve(rootDir);
  const files = [];
  function collect(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'generated') continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(file);
      else if (/\.(ts|tsx)$/.test(file)) files.push(file);
    }
  }
  collect(root);
  const graph = new Map();
  const directives = new Map();
  const errors = [];
  const relative = file => path.relative(root, file).replaceAll(path.sep, '/');
  function resolve(source, from) {
    const base = source.startsWith('@/') ? path.join(root, source.slice(2)) : source.startsWith('.') ? path.resolve(path.dirname(from), source) : null;
    if (!base) return null;
    return [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')].find(f => fs.existsSync(f) && fs.statSync(f).isFile()) ?? base;
  }
  for (const file of files) {
    const name = relative(file);
    const layer = name.split('/')[0];
    const inner = layer === 'core' || layer === 'application';
    const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    const edges = [];
    const first = ast.statements[0];
    directives.set(file, first && ts.isExpressionStatement(first) && ts.isStringLiteral(first.expression) ? first.expression.text : '');
    function report(node, message) {
      const { line } = ast.getLineAndCharacterOfPosition(node.getStart(ast));
      errors.push(`${name}:${line + 1}: ${message}`);
    }
    function dependency(node, literal) {
      if (!literal || !ts.isStringLiteralLike(literal)) {
        if (inner) report(node, 'Importación no literal en una capa interna');
        return;
      }
      const specifier = literal.text;
      const target = resolve(specifier, file);
      if (target) edges.push({ target, node });
      const targetLayer = target ? relative(target).split('/')[0] : null;
      if (inner && (!target || ![layer, ...(layer === 'application' ? ['core'] : [])].includes(targetLayer))) {
        report(node, `Dependencia no permitida: ${specifier}`);
      }
      if (layer === 'app' && /^(node:|@prisma\/|bcryptjs$|nodemailer$|qrcode$|@react-pdf\/|crypto$|fs$|path$)/.test(specifier)) report(node, `Adaptador externo en presentación: ${specifier}`);
      if (layer === 'app' && (targetLayer === 'generated' || targetLayer === 'infrastructure' && relative(target) !== 'infrastructure/config/container.ts')) {
        report(node, `Presentación debe acceder por el contenedor: ${specifier}`);
      }
      if (layer === 'infrastructure' && targetLayer === 'app') report(node, `Infraestructura no debe importar presentación: ${specifier}`);
    }
    function visit(node) {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node) && node.moduleSpecifier) dependency(node, node.moduleSpecifier);
      if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) dependency(node, node.moduleReference.expression);
      if (ts.isImportTypeNode(node)) dependency(node, ts.isLiteralTypeNode(node.argument) ? node.argument.literal : null);
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || ts.isIdentifier(node.expression) && node.expression.text === 'require')) dependency(node, node.arguments[0]);
      if (inner && ts.isIdentifier(node) && ['Buffer', 'process', 'crypto', '__dirname', '__filename'].includes(node.text)) {
        if (!(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node)) report(node, `Dependencia de runtime externo: ${node.text}`);
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    if (name.startsWith('app/cpanel/') && directives.get(file) === 'use server') {
      for (const statement of ast.statements) {
        if (!ts.isFunctionDeclaration(statement) || !statement.body || !statement.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
        const firstStatement = statement.body.statements[0];
        const guard = firstStatement && ts.isTryStatement(firstStatement) ? firstStatement.tryBlock.statements[0] : firstStatement;
        if (!guard || !ts.isExpressionStatement(guard) || !ts.isAwaitExpression(guard.expression) || !ts.isCallExpression(guard.expression.expression) || guard.expression.expression.expression.getText(ast) !== 'requireAdmin') {
          report(statement, 'La Server Action administrativa debe empezar con await requireAdmin()');
        }
      }
    }
    graph.set(file, edges);
  }
  for (const file of files.filter(f => relative(f).startsWith('app/'))) {
    const visited = new Set();
    function walk(current, chain) {
      if (visited.has(current) || ['infrastructure/config/container.ts', 'auth.ts'].includes(relative(current))) return;
      visited.add(current);
      for (const { target } of graph.get(current) ?? []) {
        const name = relative(target);
        if (name.startsWith('infrastructure/') && name !== 'infrastructure/config/container.ts' || name.startsWith('generated/')) {
          errors.push(`${relative(file)}: adaptador transitivo fuera del contenedor: ${[...chain, name].join(' → ')}`);
        } else walk(target, [...chain, name]);
      }
    }
    walk(file, [relative(file)]);
  }
  for (const file of files.filter(f => directives.get(f) === 'use client')) {
    const visited = new Set();
    function walk(current, chain) {
      if (visited.has(current) || directives.get(current) === 'use server') return;
      visited.add(current);
      for (const { target } of graph.get(current) ?? []) {
        const name = relative(target);
        if (name.startsWith('infrastructure/') || name === 'auth.ts' || name.startsWith('shared/security/')) {
          errors.push(`${relative(file)}: dependencia de servidor en Client Component: ${[...chain, name].join(' → ')}`);
        } else walk(target, [...chain, name]);
      }
    }
    walk(file, [relative(file)]);
  }
  return { errors, count: files.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { errors, count } = verificarArquitectura(process.argv[2]);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else console.log(`Arquitectura verificada: ${count} archivos; capas internas aisladas y presentación sin adaptadores directos.`);
}
