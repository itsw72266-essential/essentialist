import bcryptjs from "bcryptjs";

export async function hashRefreshToken(token) {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(token, salt);
}
