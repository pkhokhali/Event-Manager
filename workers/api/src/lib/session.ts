/** HMAC session tokens for admin login (Workers Web Crypto). */

export type SessionPayload = {
  sub: string;
  exp: number;
};

function b64urlEncode(data: ArrayBuffer | Uint8Array | string): string {
  const bytes =
    typeof data === 'string'
      ? new TextEncoder().encode(data)
      : data instanceof Uint8Array
        ? data
        : new Uint8Array(data);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): Uint8Array {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signSession(
  secret: string,
  username: string,
  ttlSeconds = 60 * 60 * 24 * 7
): Promise<{ token: string; expiresAt: string }> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload: SessionPayload = { sub: username, exp };
  const body = b64urlEncode(JSON.stringify(payload));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  const token = `${body}.${b64urlEncode(sig)}`;
  return { token, expiresAt: new Date(exp * 1000).toISOString() };
}

export async function verifySession(
  secret: string,
  token: string
): Promise<SessionPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sigPart] = parts;
  const key = await hmacKey(secret);
  const ok = await crypto.subtle.verify(
    'HMAC',
    key,
    b64urlDecode(sigPart),
    new TextEncoder().encode(body)
  );
  if (!ok) return null;
  try {
    const json = new TextDecoder().decode(b64urlDecode(body));
    const payload = JSON.parse(json) as SessionPayload;
    if (!payload.sub || !payload.exp || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
