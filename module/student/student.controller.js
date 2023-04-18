import studentModel from "../../DB/model/student.model.js";
import { asyncHandler } from "../../utils/errorHandle.js";
import moment from "moment/moment.js";
import { AppError } from "../../utils/AppError.js";
import userModel from "../../DB/model/user.model.js";

export const addStudent = asyncHandler(async (req, res, next) => {
    const { name, gender, major, branch, code } = req.body
    const exist = await studentModel.findOne({ name })
    if (exist) { return next(new AppError("student already exists", 400)) }
    const Student = new studentModel({ name, gender, major, branch, code, employee: req.user.id })
    const savedStudent = await Student.save()
    if (savedStudent) {
        await userModel.updateOne({ _id: req.user.id }, {
            $push: { students: savedStudent._id }
        })
        res.status(201).json({ msg: "success", savedStudent })
    } else {
        next(new AppError("fail", 400))
    }

})

export const searchStudent = asyncHandler(async (req, res, next) => {
    const { name } = req.body
    const exist = await studentModel.findOne({ name })
    if (!exist) { return next(new AppError("student not found", 400)) }
    res.status(200).json({ msg: "success", student: exist })
})

export const allStudents = asyncHandler(async (req, res, next) => {
    const exists = await studentModel.find({}).populate([{
        path:"employee",
        select:"name email address jobTitle -_id"
    }])
    if (!exists.length) { return next(new Error("students not found", { cause: "400" })) }
    res.status(200).json({ msg: "success", students: exists })
})

export const allStudentsWithBranch = asyncHandler(async (req, res, next) => {
    const {branch}=req.params
    const exists = await studentModel.find({branch}).populate([{
        path:"employee",
        select:"name email address jobTitle -_id"
    }])
    if (!exists.length) { return next(new Error("students not found", { cause: "400" })) }
    res.status(200).json({ msg: "success", students: exists })
})







// export const issuedBook = asyncHandler(async (req, res, next) => {
//     const { bookId, issuedUser } = req.body
//     const dateIssued = moment().format('MM/DD/YYYY')
//     const returnDate = moment(req.body.returnDate).format('MM/DD/YYYY')
//     const book = await studentModel.findOneAndUpdate({ issued: false, _id: bookId }, {
//         issued: true, dateIssued, dateReturned: returnDate, issuedUser
//     }, { new: true })
//     book ? res.status(200).json({ msg: "success", book }) : next(new Error("fail", { cause: "400" }))

// })

// export const allBooksIssued = asyncHandler(async (req, res, next) => {
//     const exists = await studentModel.find({ issued: true })
//     if (!exists.length) { return next(new Error("books not found", { cause: "400" })) }
//     res.status(200).json({ msg: "success", books: exists })
// })
// export const allBooksNotIssued = asyncHandler(async (req, res, next) => {
//     const exists = await studentModel.find({ issued: false, issuedUser: null })
//     if (!exists.length) { return next(new Error("books not found", { cause: "400" })) }
//     res.status(200).json({ msg: "success", books: exists })
// })


// export const issuedBookUser = asyncHandler(async (req, res, next) => {
//     const { issuedUser } = req.body
//     const exists = await studentModel.find({ issued: true, issuedUser })
//     if (!exists.length) { return next(new Error("books not found", { cause: "400" })) }
//     res.status(200).json({ msg: "success", books: exists })
// })


// export const allNotReturnedBooks = asyncHandler(async (req, res, next) => {
//     const books = await studentModel.find({ issued: true })
//     const nowDate = moment()
//     let fineDelay;
//     for (const i in books) {
//         books[i].fine = 20
//         fineDelay = nowDate.diff(books[i].dateReturned, 'days') * books[i].fine
//         if (fineDelay < 0) {
//             fineDelay = 0
//         }
//         books[i].fine = fineDelay
//     }
//     res.status(200).json({ msg: "success", books })
// })

// export const returnedBook = asyncHandler(async (req, res, next) => {
//     const { bookId, issuedUser } = req.body
//     const book = await studentModel.findOne({ issued: true, _id: bookId, issuedUser })
//     const nowDate = moment()
//     book.fine=20
//     let dayDelay=nowDate.diff(book.dateReturned, 'days')
//     book.dayDelay=dayDelay
//     book.fine=dayDelay*book.fine
//     const returned= await studentModel.findOneAndUpdate({issued:true,_id: bookId,issuedUser},{
//         issued:false,dateIssued:null,dateReturned:null,issuedUser:null
//     },{new:true})
//     if(!returned){ return next(new Error("no Returned book",{cause:400}))}
//     res.json({msg:"success",book})
// })