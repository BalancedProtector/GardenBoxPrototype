const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 8888;


//MongoDB Database Connection
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/your_database_name')
    .then(() => { console.log('Connected to Database'); })
    .catch(err => { console.error('Error connecting to Database:', err); });
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
});
const User = mongoose.model('User', UserSchema);

//middleware
app.use(bodyParser.json());
app.use(cors());

//validation middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];//Extract token from the "Authorization" header

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided' });
    }
    json.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user; // Attach the user information to the request object
        next(); // Proceed to the next middleware or route handler
    });
}

//In-Memory database for prototyping
const users = [];
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'YHWY'; // Replace with your own secret key
const bcrypt = require('bcrypt');

//Serve Static files from the cirrent directory
const path = require('path');
app.use(express.static(path.join(__dirname)));

//route for root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

//Protected Rout: Account
app.get('/account', authenticateToken, (req, res) => {
    const user = users.find(u => u.email === req.user.email);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Account details', user });
});
//Route: User Signup
app.post('/signup.html', (req, res) => {
    const { name, email, password, password2 } = req.body;

    //valiidate input
    if (!name || !email || !password || !password2) {
        return res.status(400).json({ message: 'All Fields are required' });
    }
    if (password !== password2) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }
    // Check if the email is already registered --- Need to make a user database to store relevent user information
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this Email' });
    }

    //Save User
    users.push({ name, email, password });
    res.status(201).json({ message: 'User registered successfully' });

    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
    res.status(201).json({ message: 'User registered successfully', token });
});
//route: User Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    //validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter your Email and Password' });
    }

    //check if user exists
    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid Email or Password' });
    }

    //Login Successful
    res.status(200).json({ message: 'Login Successful', user });
});

//Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});