import multer from "multer";
import { AppError } from "./AppError.js";

export const multerValidation={
    image:['image/jpeg', 'image/png',"image/gif"],
    pdf:["application/pdf","application/docx"]
}

export const HME = (err, req, res, next) => {
    if (err) {
        // next(new AppError(err, 500))
        res.status(400).json({ msg: "multer error", error: err })
    } else {
        next()
    }
}

export function myMulterCloud(customValidation) {
    if (!customValidation){
        customValidation=multerValidation.pdf
    }
    const storage = multer.diskStorage({})
    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb('invalid format', false)
        }
    }
    const upload = multer({ dest:"upload",fileFilter, storage })
    return upload
}