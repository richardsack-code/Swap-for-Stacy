export const logger = (req, res, next) => {
    console.log(
        new Date().toUTCString(),
        "Request from",
        req.ip,
        req.method,
        req.originalUrl
    );
    next();
};