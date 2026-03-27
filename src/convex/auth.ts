import { action } from "./_generated/server";
import { v } from "convex/values";

const INVALID_CODE_RESPONSE = { success: false, error: "Invalid code" } as const;

function createSessionToken() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

// This file intentionally contains only server-side TOTP verification.
// The secret never reaches the browser; the client submits a 6-digit code
// and Convex validates it against the environment-backed shared secret.
export const verifyTOTP = action({
  args: { code: v.string() },
  handler: async (_ctx, args) => {
    try {
      const OTPAuth = await import("otpauth");
      const TOTP_SECRET = process.env.TOTP_SECRET;
      const TOTP_ISSUER = process.env.TOTP_ISSUER || "Starter App";
      const TOTP_LABEL = process.env.TOTP_LABEL || "Owner";

      if (!TOTP_SECRET) {
        throw new Error("TOTP_SECRET environment variable is not set.");
      }

      const totp = new OTPAuth.TOTP({
        issuer: TOTP_ISSUER,
        label: TOTP_LABEL,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(TOTP_SECRET),
      });

      if (!/^\d{6}$/.test(args.code)) {
        return { success: false, error: "Invalid code format" };
      }

      const delta = totp.validate({ token: args.code, window: 1 });

      if (delta === null) {
        return INVALID_CODE_RESPONSE;
      }

      const token = createSessionToken();

      return {
        success: true,
        token,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Server error during TOTP verification"
      };
    }
  },
});
