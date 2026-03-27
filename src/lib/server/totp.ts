import { env } from "$env/dynamic/private";
import * as OTPAuth from "otpauth";

const DEFAULT_ISSUER = "Starter App";
const DEFAULT_LABEL = "Owner";

export function verifyTOTPCode(code: string) {
  const secret = env.TOTP_SECRET;

  if (!secret) {
    throw new Error("TOTP_SECRET environment variable is not set.");
  }

  if (!/^\d{6}$/.test(code)) {
    return false;
  }

  const totp = new OTPAuth.TOTP({
    issuer: env.TOTP_ISSUER || DEFAULT_ISSUER,
    label: env.TOTP_LABEL || DEFAULT_LABEL,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  return totp.validate({ token: code, window: 1 }) !== null;
}
