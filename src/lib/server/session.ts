import { createHmac, timingSafeEqual } from "node:crypto";
import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import type { Cookies } from "@sveltejs/kit";

const SESSION_COOKIE_NAME = "ascend.session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

type SessionPayload = {
  exp: number;
};

function getSessionSecret() {
  return env.TOTP_SECRET || "";
}

function sign(value: string) {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("TOTP_SECRET must be set.");
  }

  return createHmac("sha256", secret).update(value).digest("base64url");
}

function encode(payload: SessionPayload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

function decode(value: string) {
  const [data, signature] = value.split(".");

  if (!data || !signature) {
    return null;
  }

  const expected = sign(data);

  if (signature.length !== expected.length) {
    return null;
  }

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as SessionPayload;

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export function createSessionCookieValue() {
  return encode({
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  });
}

export function isValidSessionCookie(value: string | undefined) {
  if (!value) {
    return false;
  }

  try {
    return decode(value) !== null;
  } catch {
    return false;
  }
}

export function setSessionCookie(cookies: Cookies) {
  cookies.set(SESSION_COOKIE_NAME, createSessionCookieValue(), {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: !dev,
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(cookies: Cookies) {
  cookies.delete(SESSION_COOKIE_NAME, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: !dev,
  });
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}
