import * as OTPAuth from "otpauth";
import qrcode from "qrcode-terminal";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const ENV_EXAMPLE_FILE = ".env.example";
const ENV_FILE = ".env.local";
const DEFAULT_ISSUER = "Starter App";
const DEFAULT_LABEL = "Owner";
const DEFAULT_SITE_URL = "http://localhost:5173";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseEnvValue(source: string, key: string) {
  const pattern = new RegExp(`^${escapeRegExp(key)}=(.*)$`, "m");
  return source.match(pattern)?.[1] ?? "";
}

function upsertEnvValue(source: string, key: string, value: string) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${escapeRegExp(key)}=.*$`, "m");

  if (pattern.test(source)) {
    return source.replace(pattern, line);
  }

  const suffix = source.length > 0 && !source.endsWith("\n") ? "\n" : "";
  return `${source}${suffix}${line}\n`;
}

function ensureEnvFile() {
  if (existsSync(ENV_FILE)) {
    return;
  }

  if (existsSync(ENV_EXAMPLE_FILE)) {
    copyFileSync(ENV_EXAMPLE_FILE, ENV_FILE);
    return;
  }

  writeFileSync(ENV_FILE, "");
}

function readEnvFile() {
  ensureEnvFile();
  return readFileSync(ENV_FILE, "utf8");
}

function writeEnvFile(values: Record<string, string>) {
  let next = readEnvFile();

  for (const [key, value] of Object.entries(values)) {
    next = upsertEnvValue(next, key, value);
  }

  writeFileSync(ENV_FILE, next);
}

function createOtpAuthUri(secret: string, issuer: string, label: string) {
  return new OTPAuth.TOTP({
    issuer,
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  }).toString();
}

function printConfigGuide(values: {
  issuer: string;
  label: string;
  secret: string;
  convexUrl: string;
  siteUrl: string;
  convexDeployment: string;
}) {
  console.log("\nConfiguration guide\n");
  console.log("Default deployment target: Vercel");
  console.log("This starter already uses @sveltejs/adapter-vercel and includes vercel.json.\n");

  console.log(`Local file (${ENV_FILE})`);
  console.log(`- TOTP_SECRET=${values.secret}`);
  console.log(`- TOTP_ISSUER=${values.issuer}`);
  console.log(`- TOTP_LABEL=${values.label}`);
  console.log(`- PUBLIC_CONVEX_URL=${values.convexUrl}`);
  console.log(`- PUBLIC_CONVEX_SITE_URL=${values.siteUrl}`);
  console.log(`- CONVEX_DEPLOYMENT=${values.convexDeployment}`);

  console.log("\nWhat goes where");
  console.log("- PUBLIC_CONVEX_URL: your Convex deployment URL. Put this in .env.local and in Vercel.");
  console.log("- PUBLIC_CONVEX_SITE_URL: your app's public site URL. For local dev use your local origin; for Vercel use your production domain.");
  console.log("- CONVEX_DEPLOYMENT: optional local Convex CLI helper. Keep this in .env.local only.");
  console.log("- TOTP_SECRET: shared secret for login verification and session signing. Put this in .env.local and in Vercel.");
  console.log("- TOTP_ISSUER and TOTP_LABEL: Google Authenticator display values. Put these in .env.local and in Vercel.");

  console.log("\nVercel environment variables");
  console.log("- TOTP_SECRET");
  console.log("- TOTP_ISSUER");
  console.log("- TOTP_LABEL");
  console.log("- PUBLIC_CONVEX_URL");
  console.log("- PUBLIC_CONVEX_SITE_URL");

  console.log("\nConvex values to look up");
  console.log("- PUBLIC_CONVEX_URL: copy the deployment URL from Convex.");
  console.log("- CONVEX_DEPLOYMENT: copy the deployment name if you want local CLI defaults.");
}

async function main() {
  const useDefaults = process.argv.includes("--defaults") || process.argv.includes("--yes");
  const rl = createInterface({ input, output });

  try {
    const existingEnv = readEnvFile();
    const existingSecret = parseEnvValue(existingEnv, "TOTP_SECRET");
    const existingIssuer = parseEnvValue(existingEnv, "TOTP_ISSUER") || DEFAULT_ISSUER;
    const existingLabel = parseEnvValue(existingEnv, "TOTP_LABEL") || DEFAULT_LABEL;
    const existingConvexUrl = parseEnvValue(existingEnv, "PUBLIC_CONVEX_URL");
    const existingSiteUrl = parseEnvValue(existingEnv, "PUBLIC_CONVEX_SITE_URL") || DEFAULT_SITE_URL;
    const existingConvexDeployment = parseEnvValue(existingEnv, "CONVEX_DEPLOYMENT");

    const ask = async (prompt: string, defaultValue = "") => {
      if (useDefaults) {
        return defaultValue;
      }

      const suffix = defaultValue ? ` [${defaultValue}]` : "";
      const answer = (await rl.question(`${prompt}${suffix}: `)).trim();
      return answer || defaultValue;
    };

    const askYesNo = async (prompt: string, defaultYes: boolean) => {
      if (useDefaults) {
        return defaultYes;
      }

      const suffix = defaultYes ? " [Y/n]: " : " [y/N]: ";
      const answer = (await rl.question(`${prompt}${suffix}`)).trim().toLowerCase();

      if (!answer) {
        return defaultYes;
      }

      return answer === "y" || answer === "yes";
    };

    console.log("\nwlmrStack init\n");
    console.log("This setup writes .env.local, keeps Vercel as the default deployment target, and prints a Google Authenticator QR code.\n");

    if (useDefaults) {
      console.log("Running in defaults mode. Existing values are reused when available.\n");
    }

    const issuer = await ask("Google Authenticator issuer", existingIssuer);
    const label = await ask("Google Authenticator label", existingLabel);

    let secret = existingSecret;
    if (existingSecret) {
      const reuseExisting = await askYesNo("Reuse the existing TOTP secret from .env.local", true);
      if (!reuseExisting) {
        secret = new OTPAuth.Secret({ size: 32 }).base32;
      }
    } else {
      secret = new OTPAuth.Secret({ size: 32 }).base32;
    }

    const promptForConvex = await askYesNo("Enter Convex and site values now", true);
    let convexUrl = existingConvexUrl;
    let siteUrl = existingSiteUrl;
    let convexDeployment = existingConvexDeployment;

    if (promptForConvex) {
      console.log("\nConvex and site values");
      console.log("- PUBLIC_CONVEX_URL comes from Convex.");
      console.log("- PUBLIC_CONVEX_SITE_URL is your app URL, not your Convex URL.");
      console.log("- CONVEX_DEPLOYMENT is optional and only helps the local Convex CLI.\n");

      convexUrl = await ask("PUBLIC_CONVEX_URL", existingConvexUrl);
      siteUrl = await ask("PUBLIC_CONVEX_SITE_URL", existingSiteUrl);
      convexDeployment = await ask("CONVEX_DEPLOYMENT (optional)", existingConvexDeployment);
    }

    writeEnvFile({
      TOTP_SECRET: secret,
      TOTP_ISSUER: issuer,
      TOTP_LABEL: label,
      PUBLIC_CONVEX_URL: convexUrl,
      PUBLIC_CONVEX_SITE_URL: siteUrl,
      CONVEX_DEPLOYMENT: convexDeployment,
    });

    const otpAuthUri = createOtpAuthUri(secret, issuer, label);

    console.log(`\nUpdated ${ENV_FILE}.`);
    console.log("\nScan this QR code with Google Authenticator:\n");
    qrcode.generate(otpAuthUri, { small: true });

    console.log("\nGoogle Authenticator details");
    console.log(`- Issuer: ${issuer}`);
    console.log(`- Account label: ${label}`);
    console.log(`- Secret: ${secret}`);
    console.log(`- otpauth URI: ${otpAuthUri}`);

    printConfigGuide({ issuer, label, secret, convexUrl, siteUrl, convexDeployment });

    console.log("\nNext steps");
    console.log("- Run bun run dev");
    console.log("- In Vercel, add the environment variables listed above before deploying\n");
  } finally {
    rl.close();
  }
}

await main();
