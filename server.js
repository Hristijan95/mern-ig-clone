const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Database Connection
connectDB();

app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is listenenig on port ${PORT}`));
