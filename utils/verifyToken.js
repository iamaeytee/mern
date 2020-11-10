const jwt = require('jsonwebtoken');

const auth = function (req, res, next) {
    const token = req.header('auth-token');
    if(!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.SECRET_SIGNATURE);
        req.user = verified;
        next();
    } catch (err) {
        res.send(400).send('Invalid Token');
    }
}

module.exports.auth = auth;