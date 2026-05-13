import jwt from 'jsonwebtoken'

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req?.headers?.authorization
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
    const token = req.cookies?.accessToken || bearerToken

    if (!token) {
      req.userId = null
      return next()
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)
    if (decoded && decoded.id) {
      req.userId = decoded.id
    } else {
      req.userId = null
    }
    return next()
  } catch {
    req.userId = null
    return next()
  }
}

export default optionalAuth