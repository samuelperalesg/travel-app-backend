const admin = require("firebase-admin");

async function firebaseAuth(req, res, next) {
    try {
        const token = req.get("Authorization");
        if (!token) return next();
        const user = await admin.auth().verifyIdToken(token.replace("Bearer ", ""));
        if (!user) throw new Error("something went wrong");
        req.user = user;
        next();
    } catch (error) {
        res.status(400).json(error);
    }
}

function isAuthenticated(req, res, next) {
    if (!req.user) return res.status(401).json({ message: 'you must be logged in first' });
    next();
}

module.exports = { firebaseAuth, isAuthenticated };
