import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { setSessionCookie } from "$lib/server/session";
import { verifyTOTPCode } from "$lib/server/totp";

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { code } = (await request.json()) as { code?: string };

    if (!code || !verifyTOTPCode(code)) {
      return json({ success: false, error: "Invalid code" }, { status: 401 });
    }

    setSessionCookie(cookies);
    return json({ success: true });
  } catch (error) {
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      },
      { status: 500 },
    );
  }
};
