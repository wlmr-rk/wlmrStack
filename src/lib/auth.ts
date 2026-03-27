import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.PUBLIC_CONVEX_URL;
const SESSION_STORAGE_KEY = "ascend.session.token";

if (!CONVEX_URL) {
  throw new Error("PUBLIC_CONVEX_URL environment variable is not set.");
}

type AuthResult =
  | { success: true }
  | { success: false; error: string };

let convexClient: ConvexClient | null = null;
let authToken: string | null = null;

const isBrowser = () => typeof window !== "undefined";

const readStoredToken = () => (isBrowser() ? window.localStorage.getItem(SESSION_STORAGE_KEY) : null);

function writeStoredToken(token: string | null) {
  if (!isBrowser()) {
    return;
  }

  if (token) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, token);
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

function syncClientAuth(client: ConvexClient, token: string | null) {
  client.setAuth(async () => token);
}

function setSessionToken(token: string | null) {
  authToken = token;
  writeStoredToken(token);
  syncClientAuth(getConvexClient(), token);
}

export function getConvexClient(): ConvexClient {
  if (!convexClient) {
    convexClient = new ConvexClient(CONVEX_URL!);
    authToken = readStoredToken();
    syncClientAuth(convexClient, authToken);
  }

  return convexClient;
}

export async function authenticateWithTOTP(rawCode: string): Promise<AuthResult> {
  try {
    const code = rawCode.replace(/\D/g, "").slice(0, 6);
    const client = getConvexClient();
    const result = await client.action(api.auth.verifyTOTP, { code });

    if (!result?.success || !result.token) {
      return { success: false, error: result?.error || "Invalid code" };
    }

    setSessionToken(result.token);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed"
    };
  }
}

export async function signOut(): Promise<AuthResult> {
  setSessionToken(null);
  return { success: true };
}

export function isAuthenticated() {
  authToken ??= readStoredToken();
  return authToken !== null;
}
