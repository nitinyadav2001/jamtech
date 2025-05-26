import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import validator from 'validator';  // Import validator.js for email validation

const prisma = new PrismaClient();
const EXPIRATION_TIME = 3600000; // 1 hour

const authService = {

    // 1. Request to reset password (forgot password)
    async requestPasswordReset(email) {
        try {
            // Validate email format
            if (!validator.isEmail(email)) {
                throw new Error('Invalid email format.');
            }

            // Check if the user exists
            const user = await prisma.user.findUnique({
                where: { email },
            });

            // Always return the same response for security reasons (don't reveal if the email exists or not)
            if (!user) {
                return { message: 'If an account with this email exists, a password reset link has been sent.' };
            }

            // Generate a secure reset token and hash it before storing
            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            const resetTokenExpiry = new Date(Date.now() + EXPIRATION_TIME); // Token expires in 1 hour

            // Update user with the hashed reset token and expiry time
            await prisma.user.update({
                where: { email },
                data: {
                    resetPasswordToken: hashedToken,  // Store hashed version of token
                    resetPasswordTokenExpiry: resetTokenExpiry,
                },
            });

            // Send the reset token via email
            await sendPasswordResetEmail(user.email, resetToken);  // Send plain token via email

            return { message: 'If an account with this email exists, a password reset link has been sent.' };
        } catch (error) {
            throw new Error(`Error in requesting password reset: ${error.message}`);
        }
    },

    // 2. Reset password
    async resetPassword(token, newPassword) {
        try {
            // Validate password complexity (you can adjust the criteria based on security requirements)
            if (!newPassword || newPassword.length < 8) {
                throw new Error('Password must be at least 8 characters long.');
            }

            // Hash the reset token before checking it in the database
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            // Find user by hashed reset token and check token validity
            const user = await prisma.user.findFirst({
                where: {
                    resetPasswordToken: hashedToken,
                    resetPasswordTokenExpiry: {
                        gte: new Date(), // Token must still be valid (not expired)
                    },
                },
            });

            if (!user) {
                throw new Error('Invalid or expired reset token.');
            }

            // Hash the new password using bcrypt
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update the user with the new password and remove the reset token and expiry
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    resetPasswordToken: null,  // Remove token after use
                    resetPasswordTokenExpiry: null,  // Clear expiry
                },
            });

            // Invalidate all active sessions for the user
            await prisma.session.deleteMany({
                where: {
                    userId: user.id,
                    expire: {
                        gte: new Date(), // Only delete non-expired sessions
                    },
                },
            });

            return { message: 'Password has been successfully reset. Please log in with your new password.' };
        } catch (error) {
            throw new Error(`Error resetting password: ${error.message}`);
        }
    },

    // 3. Admin reset password
    async adminResetPassword(email, newPassword) {
        try {
            // Validate email format
            if (!validator.isEmail(email)) {
                throw new Error('Invalid email format.');
            }

            // Validate password complexity
            if (!newPassword || newPassword.length < 8) {
                throw new Error('Password must be at least 8 characters long.');
            }

            // Find user by email
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                throw new Error('User not found.');
            }

            // Hash the new password using bcrypt
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update the user with the new password
            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    resetPasswordToken: null,  // Remove any reset token if it exists
                    resetPasswordTokenExpiry: null,  // Clear expiry
                },
            });

            // Invalidate all active sessions for the user
            await prisma.session.deleteMany({
                where: {
                    userId: user.id,
                    expire: {
                        gte: new Date(), // Only delete non-expired sessions
                    },
                },
            });

            return { message: 'Password has been successfully reset by admin.' };
        } catch (error) {
            throw new Error(`Error resetting password by admin: ${error.message}`);
        }
    },
};

// Helper function to send the password reset email
async function sendPasswordResetEmail(email, resetToken) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const resetLink = `http://your-app.com/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: 'no-reply@your-app.com',
        to: email,
        subject: 'Password Reset',
        text: `You requested a password reset. Please use the following link to reset your password: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);
}

export default authService;
