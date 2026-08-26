export interface ITransactionManager {
  /**
   * Ejecuta fn dentro de una transacción de BD.
   * Si fn lanza, se hace rollback automáticamente.
   */
  run<T>(fn: (ctx: TransactionContext) => Promise<T>): Promise<T>;
}

export interface TransactionContext {
  // Repos transaccionales — inyectados por la implementación
  usuarioRepo: import("./IUsuarioRepository").IUsuarioRepository;
  depositoRepo: import("./IDepositoRepository").IDepositoRepository;
  facturacionRepo: import("./IFacturacionRepository").IFacturacionRepository;
  accesoRepo: import("./IAccesoRepository").IAccesoRepository;
  inscripcionRepo: import("./IInscripcionActividadRepository").IInscripcionActividadRepository;
}
