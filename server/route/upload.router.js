import { Router } from 'express'
import auth from '../middleware/auth.js'
import uploadImageController from '../controllers/uploadImage.controller.js'
import upload from '../middleware/multer.js'

const uploadRouter = Router()

const handleUploadErrors = (request, response, next) => {
    upload.single("image")(request, response, (err) => {
        if (err) {
            return response.status(400).json({
                message: err.message || "Upload failed",
                error: true,
                success: false,
            })
        }
        next()
    })
}

uploadRouter.post("/upload",auth,handleUploadErrors,uploadImageController)

export default uploadRouter