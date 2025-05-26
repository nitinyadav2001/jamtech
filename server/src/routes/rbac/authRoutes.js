import express from 'express';
import authController from '../../controllers/rbac/authController.js';

const router = express.Router();

// Forgot password
router.post('/forgot-password', authController.requestPasswordReset);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Admin reset password
router.post('/admin/reset-password', authController.adminResetPassword);

export default router;
