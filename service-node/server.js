const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./api/routes/authRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Kiểm tra JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set!');
    process.exit(1); // Dừng ứng dụng nếu thiếu secret key
}

// Cấu hình CORS
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-production-domain.com'] 
        : ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:8081'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 giờ
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Kiểm tra URI MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('MongoDB URI không được thiết lập trong biến môi trường!');
    // Trong môi trường phát triển, cho phép kết nối localhost
    if (process.env.NODE_ENV !== 'production') {
        console.log('Sử dụng MongoDB local trong môi trường development');
    } else {
        process.exit(1); // Dừng ứng dụng trong production nếu thiếu URI
    }
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI || 'mongodb://localhost:27017/url-shortener-auth')
.then(() => console.log('MongoDB connected'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

// Routes
app.use('/', authRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Authentication service running on port ${PORT}`);
});