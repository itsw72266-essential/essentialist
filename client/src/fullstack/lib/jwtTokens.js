import jwt from "jsonwebtoken";

function requireSecret(name, value) {
  if (!value || typeof value !== "string") {
    throw new Error(`${name} is not configured`);
  }
}

export function signAccessToken(userId) {
  requireSecret(
    "SECRET_KEY_ACCESS_TOKEN",
    process.env.SECRET_KEY_ACCESS_TOKEN
  );
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
  return jwt.sign(
    { id: userId },
    process.env.SECRET_KEY_ACCESS_TOKEN,
    { expiresIn }
  );
}

export function signRefreshToken(userId) {
  requireSecret(
    "SECRET_KEY_REFRESH_TOKEN",
    process.env.SECRET_KEY_REFRESH_TOKEN
  );
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "365d";
  return jwt.sign(
    { id: userId },
    process.env.SECRET_KEY_REFRESH_TOKEN,
    { expiresIn }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.SECRET_KEY_REFRESH_TOKEN);
}
