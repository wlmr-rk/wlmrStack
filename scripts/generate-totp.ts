import * as OTPAuth from "otpauth";

// Generate a new TOTP secret
const secret = new OTPAuth.Secret({ size: 32 });

console.log("\n🔐 TOTP Secret Generated!\n");
console.log("Add this to your .env.local file:");
console.log(`TOTP_SECRET=${secret.base32}`);
console.log("\nTOTP_ISSUER=Starter App");
console.log("TOTP_LABEL=Owner\n");

// Generate QR code URI
const totp = new OTPAuth.TOTP({
  issuer: "Starter App",
  label: "Owner",
  algorithm: "SHA1",
  digits: 6,
  period: 30,
  secret: secret,
});

console.log("Scan this QR code with Google Authenticator:");
console.log(totp.toString());
console.log("\nOr manually enter the secret key in Google Authenticator:");
console.log(secret.base32);
console.log("\n✅ Done! You can now use 6-digit codes from Google Authenticator to log in.\n");
