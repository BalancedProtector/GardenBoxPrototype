// Import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Initialize app and constants
const app = express();
const PORT = 8888;
const SECRET_KEY = 'YHWY'; // Replace with your own secret key

// MongoDB Database Connection
mongoose.connect('mongodb://localhost:27017/your_database_name')
    .then(() => console.log('Connected to Database'))
    .catch(err => console.error('Error connecting to Database:', err));

// Define User Schema and Model
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    growingzone: { type: String },
    preferences: {
        fruits: [String],
        vegetables: [String],
        herbs: [String],
        flowers: [String],
    },
    gardeningExperience: { type: String },
    space: { type: String },
    budget: { type: String },
    time: { type: String },
});
const User = mongoose.model('User', UserSchema);

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use(express.json()); // Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (as sent by HTML forms)

// Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
}

// Routes

// Serve Static Pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'signup.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/climate-test', (req, res) => res.sendFile(path.join(__dirname, 'climate-test.html')));
app.get('/preference-test', (req, res) => res.sendFile(path.join(__dirname, 'preference-test.html')));
app.get('/gardener-test', (req, res) => res.sendFile(path.join(__dirname, 'gardener-test.html')));
app.get('/products', (req, res) => res.sendFile(path.join(__dirname, 'products.html')));
app.get('/account', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({
            name: user.name,
            email: user.email,
            gardeningExperience: user.gardeningExperience,
            space: user.space,
            budget: user.budget,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update User Preferences
app.put('/account', authenticateToken, async (req, res) => {
    const { growingZone, gardeningExperience, space, budget, time } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        user.growingZone = growingZone || user.growingZone;
        user.gardeningExperience = gardeningExperience || user.gardeningExperience;
        user.space = space || user.space;
        user.budget = budget || user.budget;
        user.time = time || user.time;
        await user.save();
        res.status(200).json({ message: 'User preferences updated successfully!' });
    } catch (error) {
        console.error('Error updating user preferences:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
// Update User Preferences (from preference-test.html)
app.put('/preferences', authenticateToken, async (req, res) => {
    console.log('Request recieved: ', req.body); //Log the request for Debugging
    const { preferences } = req.body;

    if (!preferences) {
        return res.status(400).json({ message: 'Preferences are required.' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.preferences = preferences;
        await user.save();

        res.status(200).json({ message: 'Preferences updated successfully!' });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Verify Zipcode
app.post('/verify-zipcode', (req, res) => {
    const { zipcode } = req.body;
    if (!zipcode || !/^\d{5}$/.test(zipcode)) {
        return res.status(400).json({ message: 'Invalid Zipcode' });
    }

    const csvFiles = [
        path.join(__dirname, 'data/phzm_us_zipcode_2023.csv'),
        path.join(__dirname, 'data/phzm_ak_zipcode_2023.csv'),
        path.join(__dirname, 'data/phzm_hi_zipcode_2023.csv'),
        path.join(__dirname, 'data/phzm_pr_zipcode_2023.csv'),
    ];

    let found = false;

    const checkZipcode = (fileIndex) => {
        if (fileIndex >= csvFiles.length) {
            return res.status(404).json({ message: 'Zipcode not found' });
        }

        const filePath = csvFiles[fileIndex];
        const stream = fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                if (row.zipcode === zipcode) {
                    found = true;
                    stream.destroy();
                    return res.status(200).json({ message: 'Zipcode verified', zone: row.zone });
                }
            })
            .on('end', () => {
                if (!found) {
                    checkZipcode(fileIndex + 1);
                }
            })
            .on('error', (err) => {
                console.error(`Error reading file ${filePath}:`, err);
                return res.status(500).json({ message: 'Internal server error' });
            });
    };

    checkZipcode(0);
});

// User Signup
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, SECRET_KEY, { expiresIn: '1h' });
        res.status(201).json({ message: 'Signup successful!', token });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful!', token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Gardener Test
app.post('/gardener-test', authenticateToken, async (req, res) => {
    const { experience, time, space, budget } = req.body;

    if (!experience || !time || !space || !budget) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.gardeningExperience = experience;
        user.time = time;
        user.space = space;
        user.budget = budget;
        await user.save();

        res.status(200).json({ message: 'Gardener test data saved successfully!' });
    } catch (error) {
        console.error('Error saving gardener test data:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});