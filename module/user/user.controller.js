import userModel from "../../DB/model/user.model.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { emailFunction } from "../../utils/sendEmail.js";
import { asyncHandler } from "../../utils/errorHandle.js";
import { AppError } from "../../utils/AppError.js";
import cloudinary from "../../utils/cloudinary.js";
import { nanoid } from "nanoid";


//>>>http://localhost:3000/user/signup
export const signUp = asyncHandler(async (req, res, next) => {
    const { name, email, password, address, jobTitle, hireDate, gender, branch } = req.body;
    const existUser = await userModel.findOne({ email })
    if (existUser) { return next(new AppError("user already exist", 400)) }
    const hashPassword = bcrypt.hashSync(password, +process.env.saltOrRounds)
    const code = nanoid(5)
    const user = new userModel({ name, email, password: hashPassword, gender, address, jobTitle, hireDate, branch, code })
    const token = jwt.sign({ email: user.email, id: user._id }, process.env.signature, { expiresIn: 60 * 30 })
    const link = `${req.protocol}://${req.headers.host}/user/confirmEmail/${token}`
    const rfToken = jwt.sign({ email: user.email, id: user._id }, process.env.signature)
    const rfLink = `${req.protocol}://${req.headers.host}/user/refToken/${rfToken}`
    const info = await emailFunction(email, "confirm email", `<a href='${link}'>confirm email</a> <br>
    <a href='${rfLink}'>refresh token</a>`)
    if (info?.accepted?.length) {
        console.log(info);
        const savedUser = await user.save()
        return res.status(201).json({ msg: "success", user: savedUser })
    } else {
        return next(new AppError("email reject", 402))
    }
})


export const refToken = asyncHandler(async (req, res, next) => {
    const { token } = req.params
    if (!token) { return next(new AppError("invalid token", 400)) }
    const decoded = jwt.verify(token, process.env.signature)
    if (!decoded?.id) { return next(new AppError("invalid token payload", 401)) }
    const user = await userModel.findById(decoded.id)
    if (!user) { return next(new AppError("user not found", 404)) }
    if (user.confirmEmail) { return next(new AppError("email already confirmed", 402)) }
    const reToken = jwt.sign({ email: user.email, id: user._id }, process.env.signature, { expiresIn: 60 * 10 })
    const link = `${req.protocol}://${req.headers.host}/user/confirmEmail/${reToken}`
    emailFunction(user.email, "confirm email", `<a href='${link}'>confirm email</a>`)
    res.status(200).json({ msg: "success confirm email plz " })
})



export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params
    if (!token) { return next(new AppError("invalid token", 401)) }
    const decoded = jwt.verify(token, process.env.signature)
    if (!decoded?.id) { return next(new AppError("invalid token", 401)) }
    const user = await userModel.findByIdAndUpdate({ _id: decoded.id }, { confirmEmail: true })
    if (user.confirmEmail) { return next(new AppError("email already confirmed plz log in", 402)) }
    user ? res.status(200).json({ msg: "confirmed plz log in" }) : next(new AppError("fail", 500))

})


export const signIn = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })
    if (!user) { return next(new AppError("plz sign up first", 402)) }
    const match = bcrypt.compareSync(password, user.password)
    if (!match) { return next(new AppError("password not match", 402)) }
    if (!user.confirmEmail) { return next(new AppError("confirm your email first", 402)) }
    await userModel.updateOne({ email }, { isLoggedIn: true })
    const token = jwt.sign({ email: user.email, id: user._id }, process.env.signature)
    res.status(201).json({ msg: 'success', token })

})


export const logOut = asyncHandler(async (req, res, next) => {
    const { email } = req.body
    const user = await userModel.updateOne({ email, isLoggedIn: true }, { isLoggedIn: false })
    user.modifiedCount ? res.status(200).json({ msg: " success" }) : next(new AppError("your email already log out or deleted ", 500))
})

export const getUser = asyncHandler(async (req, res, next) => {
    const { branch } = req.params
    const users = await userModel.find({ branch }).select('name branch allFiles ')
    users.length > 0 ? res.status(200).json({ msg: " success", users }) : next(new AppError("users not found ", 500))
})

export const addFile = asyncHandler(async (req, res, next) => {
    if (!req.files.length) {
        return next(new AppError("plz enter your files", 400))
    }
    const allFiles = [];
    const publicId = [];
    for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
            folder: `user/files/${req.user.name}`
        });
        allFiles.push(secure_url)
        publicId.push(public_id)
    }
    const user = await userModel.findByIdAndUpdate({ _id: req.user.id }, { allFiles, publicId }, { new: true })
    user ? res.json({ msg: "success", user }) : next(new AppError("fail", 500))
})




