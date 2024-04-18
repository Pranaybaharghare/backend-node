const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err))
    }
}
export default asyncHandler;


// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}


/*
const asyncHandler = (fn) => {
    async (req, res, next) => {
        try {
            await fn(eq, res, next)
        } catch (error) {
            res.status(err.code).json({
                success: false,
                message: err.message
            })
        }
    }
}
*/