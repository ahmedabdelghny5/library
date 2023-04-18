import Joi from "joi";

export const addStudentValidate={
    body: Joi.object().required().keys({
        name: Joi.string().min(3).max(20).required(),
        gender: Joi.string().required(),
        major: Joi.string().required(),
        branch: Joi.string().required(),
        code: Joi.string().required(),
    })
}

export const checkToken={
    headers: Joi.object().required().keys({
        auth:Joi.string().required()
    }).options({allowUnknown: true})
}