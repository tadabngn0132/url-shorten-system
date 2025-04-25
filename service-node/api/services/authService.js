const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthService {
    // Validate user registration data
    validateRegistration(username, email, password) {
        const errors = {};

        if (!username || !email || !password) {
            errors.fields = 'All fields are required';
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            errors.email = 'Invalid email format';
        }

        // Validate password length
        if (password && password.length < 6) {
            errors.password = 'Password must be at least 6 characters long';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Create new user
    async registerUser(username, email, password) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({ $or: [{ email }, { username }] });
            if (existingUser) {
                return {
                    success: false,
                    error: 'Username or email already exists'
                };
            }

            // Create new user
            const newUser = new User({ username, email, password });
            await newUser.save();

            // Generate token
            const token = this.generateToken(newUser);

            return {
                success: true,
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                },
                token
            };
        } catch (error) {
            console.error('Registration service error:', error);
            return {
                success: false,
                error: 'Failed to register user'
            };
        }
    }

    // Login user
    async loginUser(username, password) {
        try {
            // Find user
            const user = await User.findOne({ username });
            if (!user) {
                return {
                    success: false,
                    error: 'Invalid credentials'
                };
            }

            // Validate password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    error: 'Invalid credentials'
                };
            }

            // Generate token
            const token = this.generateToken(user);

            return {
                success: true,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                token
            };
        } catch (error) {
            console.error('Login service error:', error);
            return {
                success: false,
                error: 'Failed to login'
            };
        }
    }

    // Get user profile
    async getUserProfile(userId) {
        try {
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }

            return {
                success: true,
                user
            };
        } catch (error) {
            console.error('Get profile service error:', error);
            return {
                success: false,
                error: 'Failed to get user profile'
            };
        }
    }

    // Change password
    async changePassword(userId, currentPassword, newPassword) {
        try {
            // Find user
            const user = await User.findById(userId);
            if (!user) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    error: 'Current password is incorrect'
                };
            }

            // Update password
            user.password = newPassword; // Will be hashed by pre-save hook
            await user.save();

            return {
                success: true
            };
        } catch (error) {
            console.error('Change password service error:', error);
            return {
                success: false,
                error: 'Failed to change password'
            };
        }
    }

    // Generate JWT token
    generateToken(user) {
        // Use environment variable or fallback to a default secret
        const jwtSecret = process.env.JWT_SECRET || 't4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL';
        
        return jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            jwtSecret,
            { expiresIn: '24h' }
        );
    }
}

module.exports = new AuthService();