python3 - <<'PY' > /tmp/prod-env.sh
for l in open('.env.local'):
    s = l.strip()
    if not s or s.startswith('#') or '=' not in s:
        continue
    k, v = s.split('=', 1)
    k = k.strip(); v = v.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in '"\'':
        v = v[1:-1]
    v = v.replace("'", "'\\''")
    print(f"export {k}='{v}'")
PY
source /tmp/prod-env.sh