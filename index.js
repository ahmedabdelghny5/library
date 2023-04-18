import express from 'express';
const app = express();
import { config } from 'dotenv';
config()
const PORT = process.env.PORT || 3001
import { dbConnection } from './DB/dbConnection.js';
import * as allRoutes from './module/index.routes.js'
import { AppError } from './utils/AppError.js';
import { globalError } from './utils/globalError.js';
// import { stackErr } from './utils/errorHandle.js';
import cors from 'cors'

app.use(cors())
app.use(express.json())


app.use('/user', allRoutes.userRoutes)
app.use('/student', allRoutes.studentRoutes)

app.all("*", (req, res, next) => {
    // res.json({ msg: "el path bt3k 8lt ya m3lm" })
    next(new AppError(`invalid routing ${req.originalUrl}`, 400))
})

app.use(globalError)
dbConnection()
app.listen(PORT, () => {
    console.log(`Express server listening on ${PORT}`);
});

