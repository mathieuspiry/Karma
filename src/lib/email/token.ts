import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.DONE_LINK_SECRET ?? "";
const TTL_DAYS = 14;

function hmac(data: string): string {
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function createDoneToken(batchItemId: string): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_DAYS * 86400;
  const payload = Buffer.from(JSON.stringify({ id: batchItemId, exp })).toString("base64url");
  const sig = hmac(payload);
  return `${payload}.${sig}`;
}

export function verifyDoneToken(token: string): { batchItemId: string } | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  // Timing-safe comparison
  const expected = hmac(payload);
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }

  let parsed: { id: string; exp: number };
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (Math.floor(Date.now() / 1000) > parsed.exp) return null; // expired

  return { batchItemId: parsed.id };
}
