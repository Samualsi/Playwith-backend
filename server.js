const express = require('express');
const fs = require('fs');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATA_FILE = './channels.json';

// --- CONFIGURATION ---
const ADMIN_USER = "admin";
const ADMIN_PASS = "12345"; // CHANGE THIS!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Setup Sessions
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 } // Log out after 1 hour
}));

// Middleware to check if user is logged in
const checkAuth = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login.html');
    }
};

// --- ROUTES ---

// Login logic
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.loggedIn = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Logout logic
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

// Protected Admin Page
app.get('/admin.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'admin.html'));
});

// Protected Data API
app.get('/api/channels', (req, res) => {
    const data = fs.readFileSync(DATA_FILE);
    res.json(JSON.parse(data));
});

app.post('/api/channels', checkAuth, (req, res) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ message: "Saved!" });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));