import multer from 'multer'

const storage = multer.memoryStorage()

const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
])

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

const fileFilter = (request, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        return cb(new Error('Only JPEG, PNG, WEBP, or AVIF image uploads are allowed'), false)
    }
    return cb(null, true)
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
        files: 10,
    },
})

export default upload