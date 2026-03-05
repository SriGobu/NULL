const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Passwords do not match' 
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        const newUser = new User({
            name: name,
            email: email.toLowerCase(),
            password: password
        });

        await newUser.save();

        res.status(201).json({ 
            success: true, 
            message: 'User registered successfully',
            data: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                createdAt: newUser.createdAt
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Error registering user: ' + error.message 
        });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Login successful',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error logging in: ' + error.message 
        });
    }
});

// Get all users (for testing only)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ 
            success: true, 
            data: users 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching users: ' + error.message 
        });
    }
});

module.exports = router;
