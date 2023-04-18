import mongoose from "mongoose";

const studentSchema = mongoose.Schema({
    name: String,
    employee: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
    major: String,
    branch: String,
    code: { type: String, default: "" },
}, {
    timestamps: true
})

const studentModel = mongoose.model('student', studentSchema)
export default studentModel