import crypto from "crypto";
import bcrypt from "bcryptjs";

const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || ""; 
const IV_LENGTH = 16;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  
  
}

export function encrypt(text: string): string {
  const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || "";
  if (!ENCRYPTION_KEY) throw new Error("Encryption key not set");
  
  
  let keyBuffer: Buffer;
  if (ENCRYPTION_KEY.length === 64) {
    keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");
  } else if (ENCRYPTION_KEY.length === 32) {
    keyBuffer = Buffer.from(ENCRYPTION_KEY);
  } else {
    throw new Error(`Invalid encryption key length: ${ENCRYPTION_KEY.length}. Must be 32 chars or 64 hex chars.`);
  }
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(text: string): string {
  const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || "";
  if (!ENCRYPTION_KEY) throw new Error("Encryption key not set");

  let keyBuffer: Buffer;
  if (ENCRYPTION_KEY.length === 64) {
    keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");
  } else if (ENCRYPTION_KEY.length === 32) {
    keyBuffer = Buffer.from(ENCRYPTION_KEY);
  } else {
    throw new Error("Invalid encryption key length");
  }

  const [ivHex, authTagHex, encryptedHex] = text.split(":");
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

export async function hash(text: string): Promise<string> {
  return await bcrypt.hash(text, 10);
}

export async function compareHash(text: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(text, hash);
}
