import crypto from "crypto";

const generatedOtp = ()=>{
    return crypto.randomInt(100000, 1000000)  /// 100000 to 999999
}
export default generatedOtp