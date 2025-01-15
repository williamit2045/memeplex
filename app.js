//app.js
require('dotenv').config();
const express = require('express');
const { pool } = require('./config/database');
const app = express();
const routes = require('./routes/index');

// ------------------------------------
// Middleware Setup
// ------------------------------------
app.set('view engine', 'ejs'); // Use EJS as the templating engine
app.use(express.static('public')); // Serve static files from the 'public' folder
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies
app.use('/', routes);


// ⚠️ Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).send('Something broke!');
});

// 🚀 Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});