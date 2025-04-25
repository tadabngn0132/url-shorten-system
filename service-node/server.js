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

// JWT Secret - Sử dụng giá trị cố định nếu biến môi trường không tồn tại
const JWT_SECRET = process.env.JWT_SECRET || 't4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL';
console.log('Using JWT_SECRET:', JWT_SECRET.substring(0, 5) + '...');

// Cấu hình CORS
const corsOptions = {
    origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:9999'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));

// Middleware
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

// Routes - Restore to original configuration
app.use('/', authRoutes);

// Khởi động server
app.listen(PORT, () => {
    console.log(`Authentication service running on port ${PORT}`);
});