// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import twilio from 'twilio';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

const router = express.Router();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const OTP_EXPIRY_MINUTES = process.env.OTP_EXPIRY_MINUTES || 5;

// Helper function to generate OTP
function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

// Send OTP
router.post('/send-otp', async (req, res) => {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
        return res.status(400).json({ message: 'Mobile number is required.' });
    }

    try {
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

        // Upsert user with new OTP and expiration
        let user = await User.findOneAndUpdate(
            { mobileNumber },
            { otp, otpExpiresAt },
            { new: true, upsert: true }
        );

        // Send OTP via Twilio
        await client.messages.create({
            body: `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: mobileNumber
        });

        res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending OTP.' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
        return res.status(400).json({ message: 'Mobile number and OTP are required.' });
    }

    try {
        const user = await User.findOne({ mobileNumber });

        if (!user || user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        // Check OTP expiration
        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP has expired.' });
        }

        // Clear OTP and expiration
        user.otp = null;
        user.otpExpiresAt = null;
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'OTP verified successfully.', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying OTP.' });
    }
});

export default router;
