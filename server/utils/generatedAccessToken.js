// D:\EssentialistMakeupStore\server\utils\generatedAccessToken.js
import jwt from 'jsonwebtoken'

const generatedAccessToken = async(userId)=>{
    const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
    const token = await jwt.sign({ id : userId},
        process.env.SECRET_KEY_ACCESS_TOKEN,
        { expiresIn : accessTokenExpiresIn}
    )

    return token
}

export default generatedAccessToken