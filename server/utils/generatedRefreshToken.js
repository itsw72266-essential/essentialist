// D:\EssentialistMakeupStore\server\utils\generatedRefreshToken.js
import jwt from 'jsonwebtoken'

const genertedRefreshToken = async(userId)=>{
    const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '365d'
    const token = await jwt.sign({ id : userId},
        process.env.SECRET_KEY_REFRESH_TOKEN,
        { expiresIn : refreshTokenExpiresIn}
    )

    return token
}

export default genertedRefreshToken