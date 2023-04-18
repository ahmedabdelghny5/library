import { Router } from "express";
import { auth, role } from "../../middleWare/auth.js";
import { validate } from "../../middleWare/validation.js";
const router = Router();
import *  as SC from './student.controller.js'
import * as SV from "./student.validate.js";

router.post("/addStudent", validate(SV.checkToken,SV.addStudentValidate), auth(role.User), SC.addStudent)
router.get("/searchStudent", auth(role.User), SC.searchStudent)
router.get("/allStudents", auth([role.Admin,role.User]), SC.allStudents)
router.get("/allStudentsWithBranch/:branch", auth([role.Admin,role.User]), SC.allStudentsWithBranch)


export default router  