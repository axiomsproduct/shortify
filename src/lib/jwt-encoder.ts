/**
 * JWT (HS256) & Base64 URL Encoder / Decoder
 * Encodes route parameters into Base64, wraps inside JWT payload,
 * and signs with HMAC-SHA256 (HS256).
 */

const DEFAULT_SECRET = "shortify_satyamrojhax_lfrdcatechnologies_hs256_secret_key";

function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rawSha256(bytes: Uint8Array): Uint8Array {
  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const w = new Array<number>(64);
  const byteLen = bytes.length;
  const bitLen = byteLen * 8;
  const newLen = (((byteLen + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(newLen);
  padded.set(bytes);
  padded[byteLen] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(newLen - 4, bitLen, false);

  for (let chunk = 0; chunk < newLen; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(chunk + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = H[0],
      b = H[1],
      c = H[2],
      d = H[3],
      e = H[4],
      f = H[5],
      g = H[6],
      h = H[7];
    for (let i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }
  const res = new Uint8Array(32);
  const rView = new DataView(res.buffer);
  for (let i = 0; i < 8; i++) rView.setUint32(i * 4, H[i], false);
  return res;
}

export function base64Encode(str: string): string {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    try {
      return window.btoa(unescape(encodeURIComponent(str)));
    } catch {
      // fallback
    }
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf8").toString("base64");
  }
  return "";
}

export function base64Decode(b64: string): string {
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    try {
      return decodeURIComponent(escape(window.atob(b64)));
    } catch {
      // fallback
    }
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(b64, "base64").toString("utf8");
  }
  return "";
}

export function toBase64Url(strOrBytes: string | Uint8Array): string {
  let b64 = "";
  if (typeof strOrBytes === "string") {
    b64 = base64Encode(strOrBytes);
  } else {
    let bin = "";
    for (let i = 0; i < strOrBytes.length; i++) {
      bin += String.fromCharCode(strOrBytes[i]);
    }
    if (typeof window !== "undefined" && typeof window.btoa === "function") {
      b64 = window.btoa(bin);
    } else if (typeof Buffer !== "undefined") {
      b64 = Buffer.from(strOrBytes).toString("base64");
    }
  }
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(b64url: string): string {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) {
    b64 += "=";
  }
  return base64Decode(b64);
}

export function hmacSha256(keyStr: string, msgStr: string): string {
  const enc = new TextEncoder();
  let kBytes: Uint8Array = enc.encode(keyStr);
  if (kBytes.length > 64) kBytes = new Uint8Array(rawSha256(kBytes));
  const keyPad = new Uint8Array(64);
  keyPad.set(kBytes);
  const oKeyPad = new Uint8Array(64);
  const iKeyPad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    oKeyPad[i] = keyPad[i] ^ 0x5c;
    iKeyPad[i] = keyPad[i] ^ 0x36;
  }
  const mBytes = enc.encode(msgStr);
  const innerBuf = new Uint8Array(64 + mBytes.length);
  innerBuf.set(iKeyPad);
  innerBuf.set(mBytes, 64);
  const innerHash = rawSha256(innerBuf);

  const outerBuf = new Uint8Array(64 + 32);
  outerBuf.set(oKeyPad);
  outerBuf.set(innerHash, 64);
  const outerHash = rawSha256(outerBuf);

  return toBase64Url(outerHash);
}

/**
 * Creates a signed JWT using HS256 algorithm.
 */
export function createHs256Jwt(payload: Record<string, unknown>, secret = DEFAULT_SECRET): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const headerB64 = toBase64Url(JSON.stringify(header));
  const payloadB64 = toBase64Url(JSON.stringify(payload));
  const message = `${headerB64}.${payloadB64}`;
  const signature = hmacSha256(secret, message);

  return `${message}.${signature}`;
}

/**
 * Decodes a JWT and verifies its payload.
 */
export function decodeHs256Jwt<T = Record<string, unknown>>(token: string): T | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payloadJson = fromBase64Url(parts[1]);
    return JSON.parse(payloadJson) as T;
  } catch {
    return null;
  }
}

/**
 * Converts route URL parameters into Base64, and then wraps and signs it
 * inside an HS256 JWT token.
 */
export function encodeUrlParamsToJwt(
  params: Record<string, string>,
  pathname = "/home",
  secret = DEFAULT_SECRET,
): { b64: string; jwt: string } {
  // 1. Generate standard query string
  const searchEntries = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  // 2. Base64-encode the entire parameter string
  const rawBase64 = base64Encode(searchEntries);

  // 3. Construct JWT payload containing the base64 URL and data
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    iss: "shortify",
    sub: params.userId || "anonymous",
    aud: "lfrdcatechnologies",
    author: params.author || "satyamrojhax",
    product_by: params.product_by || "lfrdcatechnologies",
    path: pathname,
    iat: now,
    exp: now + 86400 * 365,
    url_b64: rawBase64,
    params,
  };

  // 4. Sign with HS256
  const jwt = createHs256Jwt(jwtPayload, secret);

  return {
    b64: rawBase64,
    jwt,
  };
}
