let mode = process.env.MODE

export const globalError = (err, req, res, next) => {
    if (mode == 'prod') {
        prodMode(err, res)
    } else {
        devMode(err, res)
    }
}

const prodMode = (err, res) => {
    let code = err.statusCode || 500
    res.status(code).json({
        msg: "catch error",
        error: err.message,
    })

}

const devMode = (err, res) => {
    let code = err.statusCode || 500
    res.status(code).json({
        msg: "catch error",
        error: err.message,
        stack: err.stack
    })

}