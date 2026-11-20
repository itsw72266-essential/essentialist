import crypto from "crypto";

export default function generatedOtp() {
  return crypto.randomInt(100000, 1000000);
}
