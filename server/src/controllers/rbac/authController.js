import authService from '../../services/rbac/authService.js';
import validator from 'validator';  // For input validation

const authController = {

    // 1. Request a password reset (forgot password)
    async requestPasswordReset(req, res) {
        const { email } = req.body;

        // Validate email input
        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ error: 'Valid email is required.' });
        }

        try {
            const response = await authService.requestPasswordReset(email);
            return res.status(201).json(response);  // 201: Created (an email action has been initiated)
        } catch (error) {
            // Return a 500 if the error is unexpected, or handle specific errors like missing user
            return res.status(500).json({ error: `Error requesting password reset: ${error.message}` });
        }
    },

    // 2. Reset password
    async resetPassword(req, res) {
        const { token, newPassword } = req.body;

        // Validate token and password input
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ error: 'Valid reset token is required.' });
        }
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
        }

        try {
            const response = await authService.resetPassword(token, newPassword);
            return res.status(200).json(response);  // 200: OK (password has been successfully reset)
        } catch (error) {
            // Differentiate between invalid/expired token and other issues
            if (error.message.includes('Invalid or expired token')) {
                return res.status(400).json({ error: error.message });  // 400: Bad Request for invalid token
            }
            return res.status(500).json({ error: `Error resetting password: ${error.message}` });
        }
    },

    /**
     * Admin reset password
     * Endpoint: POST /api/admin/reset-password
     * Body Parameters: { email, newPassword }
     */
    async adminResetPassword(req, res) {
        try {
            const { email, newPassword } = req.body;
            const response = await authService.adminResetPassword(email, newPassword);
            return res.status(200).json({ success: true, data: response });
        } catch (error) {
            return res.status(400).json({ success: false, error: error.message });
        }
    },
};

export default authController;
