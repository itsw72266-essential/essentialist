export default function generatedOtp() {
  return Math.floor(Math.random() * 900000) + 100000;
}
