// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Set up storage for uploaded videos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the filename
    },
});

const upload = multer({ storage });

// Ensure uploads directory exists
const fs = require('fs');
try {
    if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads', { recursive: true });
    }
} catch (error) {
    console.error('Error creating uploads directory:', error);
}

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// API endpoint for uploading videos
app.post('/api/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    // Here you would implement your video enhancement logic
    res.json({ message: 'Video uploaded successfully', filePath: `/uploads/${req.file.filename}` });
});

// Serve index.html from root directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, 'client/build')));

// Handle any remaining requests by serving the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});