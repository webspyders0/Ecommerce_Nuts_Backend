import express from 'express';
import { forgotPassword, resetPassword } from '../controllers/emailController.js';


const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword); // Change to PATCH


export default router;
