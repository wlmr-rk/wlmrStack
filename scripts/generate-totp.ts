import * as OTPAuth from "otpauth";
import qrcode from "qrcode-terminal";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const ENV_FILE = ".env.local";
const DEFAULT_ISSUER = "Starter App";
const DEFAULT_LABEL = "Owner";

function upsertEnvValue(source: string, key: string, value: string) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");

  if (pattern.test(source)) {
    return source.replace(pattern, line);
  }

  const suffix = source.length > 0 && !source.endsWith("\n") ? "\n" : "";
  return `${source}${suffix}${line}\n`;
}

function writeLocalEnv(secret: string) {
  const existing = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : "";
  let next = existing;

  next = upsertEnvValue(next, "TOTP_SECRET", secret);
  next = upsertEnvValue(next, "TOTP_ISSUER", DEFAULT_ISSUER);
  next = upsertEnvValue(next, "TOTP_LABEL", DEFAULT_LABEL);

  writeFileSync(ENV_FILE, next);
}

// Generate a new TOTP secret
const secret = new OTPAuth.Secret({ size: 32 });

writeLocalEnv(secret.base32);

console.log("\n🔐 TOTP Secret Generated!\n");
console.log(`Updated ${ENV_FILE} with:`);
console.log(`TOTP_SECRET=${secret.base32}`);
console.log(`TOTP_ISSUER=${DEFAULT_ISSUER}`);
console.log(`TOTP_LABEL=${DEFAULT_LABEL}\n`);

// Generate QR code URI
const totp = new OTPAuth.TOTP({
  issuer: DEFAULT_ISSUER,
  label: DEFAULT_LABEL,
  algorithm: "SHA1",
  digits: 6,
  period: 30,
  secret: secret,
});

const otpAuthUri = totp.toString();

console.log("Scan this QR code with Google Authenticator:\n");
qrcode.generate(otpAuthUri, { small: true });
console.log("\nIf your terminal cannot display the QR cleanly, use this otpauth URI:");
console.log(otpAuthUri);
console.log("\nOr manually enter the secret key in Google Authenticator:");
console.log(secret.base32);
console.log("\n✅ Done! You can now use 6-digit codes from Google Authenticator to log in.\n");
