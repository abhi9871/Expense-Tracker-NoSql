const jwt = require('jsonwebtoken');
const User = require('../models/user');
const dotEnv = require('dotenv').config(); // To access env variables

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        const userObj = jwt.verify(token, process.env.TOKEN_SECRET_KEY); // It will get id and name after decryption as an object
        const userId = userObj.id;
        const user = await User.findById(userId);
        if(user){
            req.user = user;
            next();
        }
        else {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

    } catch (err) {
        console.log(err.message);
        return res.status(401).json({ success: false });
    }
}

module.exports = {
    authenticate
}

