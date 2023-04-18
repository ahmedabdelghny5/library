import { AppError } from "../utils/AppError.js"


const method = ['body', 'params', 'query', 'files', 'files']

export const validate = (schema) => {
    return (req, res, next) => {
        let arrErrors = []
        method.map((key) => {
            if (schema[key]) {
                const { error } = schema[key].validate(req[key], { abortEarly: false })
                if (error?.details) {
                    error.details.map((error) => {
                        arrErrors.push(error.message)
                    })
                }
            }
        })
        if (arrErrors.length > 0) {
            res.status(402).json({ error: arrErrors, msg: "validation failed" })
        } else {
            next()
        }
    }
}