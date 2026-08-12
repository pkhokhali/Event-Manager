export function nowIso() {
  return new Date().toISOString();
}

export function newId() {
  return crypto.randomUUID();
}
