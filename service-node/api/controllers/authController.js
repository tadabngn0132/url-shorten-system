const authService = require('../services/authService');

// Register new user
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        const validation = authService.validateRegistration(username, email, password);
        if (!validation.isValid) {
            return res.status(400).json({ error: validation.errors });
        }

        // Register user
        const result = await authService.registerUser(username, email, password);
        
        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.status(201).json({
            message: 'User registered successfully',
            token: result.token,
            user: result.user
        });
    } catch (error) {
        console.error('Registration controller error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Login user
        const result = await authService.loginUser(username, password);
        
        if (!result.success) {
            return res.status(401).json({ error: result.error });
        }

        res.json({
            message: 'Login successful',
            token: result.token,
            user: result.user
        });
    } catch (error) {
        console.error('Login controller error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Verify token
exports.verifyToken = (req, res) => {
    res.json({
        user: req.user,
        isAuthenticated: true
    });
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        console.log('getProfile called, user ID:', req.user.id);
        
        // Đảm bảo req.user tồn tại
        if (!req.user || !req.user.id) {
            console.log('User data missing in request');
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const result = await authService.getUserProfile(req.user.id);
        
        if (!result.success) {
            console.log('Failed to get profile:', result.error);
            return res.status(404).json({ error: result.error });
        }

        console.log('Profile retrieved successfully');
        res.json(result.user);
    } catch (error) {
        console.error('Profile controller error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        // Validate new password
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        // Change password
        const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
        
        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password controller error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};