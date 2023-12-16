const Brevo = require("@getbrevo/brevo");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path = require("path"); // Import the path module
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const ForgotPasswordRequest = require("../models/forgotpasswordrequest");

dotenv.config(); // To use env file variables

// Hashing the password function
const hashPassword = async (password, saltRounds) => {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

// Function to send reset link
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const requestId = uuidv4();
    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "This email address does not exist. Please try with a valid email address",
        });
    }

    // Create a request id after the mail verified
    const passwordRequest = new ForgotPasswordRequest({
      id: requestId,
      userId: user._id,
    });

    await passwordRequest.save();

    // Integrating email brevo functionality once the user's mail is verified
    const client = Brevo.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_KEY;
    const transEmailApi = new Brevo.TransactionalEmailsApi();
    const sender = {
      email: process.env.SENDER_EMAIL,
      name: process.env.SENDER_NAME,
    };
    const receivers = [
      {
        email: email,
      },
    ];

    const response = await transEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Expense Tracker Reset Password",
      htmlContent: `<html>
        <head>
            <style>    
                .email-content {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #fceabb 0%, #f8b500 100%) !important;
                    border-radius: 10px;
                }
                .email-content p {
                    color: black;
                }
                .reset-link {
                    text-align: center;
                }
                a {
                  text-decoration: none;
                  color: white !important;
                  display: inline-block;
                  background-color: #007BFF;
                  padding: 10px 20px;
                  border-radius: 5px;
                }
                h1 {
                    color: #007BFF;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="email-content">
                <h1>Expense Tracker <span>&#x1F60A;</span></h1>
                <p>Regain control of your financial journey! Reset your password and stay on top of your expenses with ease.</p>
                <p>Hi {{params.userName}}! We received a request from you to reset your password. Click the button below to reset your password:</p>
                <div class="reset-link">
                <a href=http://${process.env.HOST}:5000/password/resetpassword/{{params.requestId}} class="button">Reset Password</a>
                </div>
            </div>
        </body>
        </html>`,
      params: {
        requestId: requestId,
        userName: user.name,
      },
    });
    res.status(200).json({ 
      success: true, 
      message: "An email containing the reset link has been sent to your email address" 
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
        success: false,
        message: "Something went wrong while sending the reset link",
      });
  }
};

exports.resetPasswordPage = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const response = await ForgotPasswordRequest.find({ id: requestId });
    if (!response) {
      return res.status(404).send("Invalid link or request ID");
    }

    // Check for the link whether it is expired or not
    const expirationTime = new Date(response[0].createdAt).getTime() + 30 * 60 * 1000; // 30 minutes in milliseconds
    const currentTime = new Date().getTime(); // Current time in milliseconds

    if (currentTime > expirationTime) {
      await ForgotPasswordRequest.updateOne({ id: response[0].id },{ $set: { isActive: "false" } });
      return res.status(404).send("This link has expired");
    }

    // Serve the reset password HTML page
    res.status(200).render("resetpassword", { requestId: requestId, success: true });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

// Function for resetting the password
exports.updatePassword = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const updatedPassword = req.body.password; // to call by element name or id attribute
    const response = await ForgotPasswordRequest.find({ id: requestId });

     // Check whether the request id is active or not
    if (response[0].isActive) {
      if (updatedPassword.split(" ").join("").length < 8) {
        // Check for the password length
        return res.status(400).render("resetpassword", { requestId: requestId, success: false });
      }

      const saltRounds = 10;
      const password = await hashPassword(updatedPassword, saltRounds); // Call the hashPassword function and await its result
      const userId = response[0].userId;
      await User.updateOne({ _id: userId }, { $set: { password: password } });
      await ForgotPasswordRequest.updateOne({id: response[0].id}, { $set: {isActive: "false"} });
      res.status(200).render("backtologin", { host: process.env.HOST });
    } else {
      res.status(404).send("This link is expired");
    }
  } catch (err) {
    res.status(500).send("Something went wrong");
    console.log(err);
  }
};
