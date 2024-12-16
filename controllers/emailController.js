import expressAsyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';  
import * as dotenv from 'dotenv';
import { hassPassword } from '../utils/passwordUtil.js';

dotenv.config();

// Configure Nodemailer transporter
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "campusvoices123@gmail.com",
        pass: process.env.SMTP_PASS,
    },
});

// Generate JWT for Reset Password
const generateResetToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Forgot Password Controller
export const forgotPassword = expressAsyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(200).json({ message: 'If a user with this email exists, a password reset link has been sent.' });
    }
    // Generate a reset token
    const resetToken = generateResetToken(user._id); // Make sure to pass user._id
    // Store the token and expiration in the database
    user.resetPasswordToken = resetToken; // Store the plain token
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });
    // Create reset URL
    // const resetURL = `http://localhost:5173/redirect/reset-password/${resetToken}`;
    // Create reset URL dynamically from the request object
    const resetURL = `${req.protocol}://${req.get('host')}/redirect/reset-password/${resetToken}`;
    // Configure email options
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Password Reset Request',
        text: `You are receiving this because you (or someone else) requested the reset of the password for your account.\n\n
           Please click on the following link, or paste this into your browser to complete the process:\n\n
           ${resetURL}\n\n
           If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };
    // Send email
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'If a user with this email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Error sending email:', error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500).json({ message: 'Error sending the email. Please try again later.' });
    }
});

export const resetPassword = expressAsyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        // Find user by token and check if it's expired
        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        // Hash the new password and update the user's password
        user.password = await hassPassword(password);
        // Clear the reset token and expiration
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(400).json({ message: 'Error resetting password' });
    }
});

// handling email transfer events 
export const sendEmail = expressAsyncHandler(async (req, res) => {
    const { receiverEmail, subject, message } = req.body;
    console.log(receiverEmail, subject, message);

    const mailOptions = {
        from: process.env.SMPT_USER,
        to: receiverEmail,
        subject: subject,
        text: message
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Failed to send email" });
    }
});

