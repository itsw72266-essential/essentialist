import { verifyAccessToken } from "./jwtTokens.js";
import { getAccessTokenFromRequest } from "./authFromRequest.js";

export function resolveAuthUserId(nextRequest, { required = true } = {}) {
  const token = getAccessTokenFromRequest(nextRequest);
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

/** Like Express `optionalAuth`: never errors; `userId` is string or `null`. */
export function resolveOptionalAuthUserId(nextRequest) {
  const token = getAccessTokenFromRequest(nextRequest);
  if (!token) return { userId: null };
  try {
    const decoded = verifyAccessToken(token);
    return { userId: decoded.id };
  } catch {
    return { userId: null };
  }
}
