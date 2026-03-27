type AuthResult =
  | { success: true }
  | { success: false; error: string };

async function postAuth(path: string, body?: Record<string, unknown>): Promise<AuthResult> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const result = (await response.json().catch(() => null)) as
      | { success?: boolean; error?: string }
      | null;

    if (!response.ok || !result?.success) {
      return { success: false, error: result?.error || "Authentication failed" };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  }
}

export async function authenticateWithTOTP(rawCode: string): Promise<AuthResult> {
  const code = rawCode.replace(/\D/g, "").slice(0, 6);
  return postAuth("/auth/login", { code });
}

export async function signOut(): Promise<AuthResult> {
  return postAuth("/auth/logout");
}
