
import jwt from 'jsonwebtoken'
import userModel from '../DB/model/user.model.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/errorHandle.js';


export const role={
    Admin:"admin",
    User:"user"
}


export const auth = (accessRole=[]) => {
    return asyncHandler(async (req, res, next) => {
        
        const { auth } = req.headers;
        if (!auth) {
            return next(new AppError("please inter token authentication", 401))
        }
        if (!auth.startsWith("ahmed__")) {
            return next(new AppError("invalid token", 401))
        }
        const token = auth.split("ahmed__")[1];
        const decoded = jwt.verify(token, process.env.signature)
        if (!decoded?.id) {
            return next(new AppError("invalid token payload", 401))
        }
        const user = await userModel.findById(decoded.id)
        if (!user || user.isLoggedIn == false || user.confirmEmail == false || user.isDeleted == true) {
            return next(new AppError("plz check your email", 402))
        }
        if(!accessRole.includes(user.role)){
            return next(new AppError("you are not authorized", 402))
        }
        req.user = user
        next()
})
}