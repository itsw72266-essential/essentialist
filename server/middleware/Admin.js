import UserModel from "../models/user.model.js"

export const admin = async(request,response,next)=>{
    try {
       const  userId = request.userId

       if(!userId){
            return response.status(401).json({
                message : "Authentication required",
                error : true,
                success : false
            })
       }

       const user = await UserModel.findById(userId).select("role")

       if(!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)){
            return response.status(403).json({
                message : "Permission denial",
                error : true,
                success : false
            })
       }

       next()

    } catch (error) {
        return response.status(500).json({
            message : "Permission denial",
            error : true,
            success : false
        })
    }
}