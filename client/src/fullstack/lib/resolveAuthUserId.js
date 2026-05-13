import { verifyAccessToken } from "./jwtTokens.js";
import { getBearerToken } from "./authFromRequest.js";

export function resolveAuthUserId(nextRequest, { required = true } = {}) {
  const token = getBearerToken(nextRequest);
  if (!token) {
    if (!required) return { userId: null };
    return {
      error: {
        status: 401,
        body: { message: "Provide token", error: true, success: false },
      },
    };
  }
  try {
    const decoded = verifyAccessToken(token);
    return { userId: decoded.id };
  } catch {
    return {
      error: {
        status: 401,
        body: {
          message: "unauthorized access",
          error: true,
          success: false,
        },
      },
    };
  }
}
