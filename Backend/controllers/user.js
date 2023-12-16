const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const dotEnv = require('dotenv');
dotEnv.config(); // To access env variables

const generateToken = (userId, userName, isPremiumUser) => {
  try {
    const secretKey = process.env.TOKEN_SECRET_KEY;
    const token = jwt.sign({ id: userId, name: userName, isPremiumUser }, secretKey, { expiresIn: '1h' });
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
}

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (password.split(' ').join('').length < 8) {
      return res.status(400).json({success: false, errors: { password: "Password must be atleast 8 characters long" } });
    }
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const user = new User({
      name: name,
      email: email,
      password: hash,
    });
    await user.save();
    res.status(200).json({ success: true, message: "Sign up successful." });
  } catch (err) {
    if (err.name === "ValidationError") {
      const validationErrors = {};
      Object.keys(err.errors).forEach((key) => {
        validationErrors[key] = err.errors[key].message;
      });
      res.status(400).json({ success: false, errors: validationErrors });
    } else if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      res.status(400).json({success: false, errors: { email: "Email already exists" },
      });
    } else {
      console.log(err);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
        // Generate a jwt token to encrypt user id
        const userId = user._id;
        const userName = user.name;
        const isPremiumUser = user.isPremiumUser;
        const result = await bcrypt.compare(password, user.password);
        if(result){
            res.status(200).json({ success: true, token: generateToken(userId, userName, isPremiumUser) });
        }
        else {
            res.status(401).json({ success: false, message: "User not authorized" });
        }
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (err) {
        res.status(500).json({ success: false, message: "An error occurred" });
  }
};

module.exports = {
  generateToken,
  createUser,
  loginUser
}