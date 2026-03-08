const express = require('express');
const fs = require('fs');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'channels.json');

// --- ADMIN CREDENTIALS ---
// Change these for better security
const ADMIN_USER = "admin";
const ADMIN_PASS = "12345"; // CHANGE THIS!

// --- MIDDLEWARE ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup Session (Cookies)
app.use(session({
    secret: 'tv-app-super-secret-key', // Change this to any random string
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600000, // Session expires in 1 hour
        httpOnly: true
    }
}));

// Serve files from the "public" folder (index.html, login.html)
app.use(express.static('public'));

// Initialize channels.json if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// --- SECURITY MIDDLEWARE ---
// This function checks if a user is logged in before allowing access
const checkAuth = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        // If not logged in, send 401 error or redirect
        if (req.path.startsWith('/api/')) {
            res.status(401).json({ error: "Unauthorized" });
        } else {
            res.redirect('/login.html');
        }
    }
};

// --- AUTH ROUTES ---

// Login API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.loggedIn = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Invalid username or password" });
    }
});

// Logout API
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

// --- PAGE ROUTES ---

// Protected Admin Page (serves from /private folder)
app.get('/admin.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'admin.html'));
});

// --- DATA API ROUTES ---

// GET Channels: Used by both the TV player and the Admin panel
// This is public so the TV Player can load the list
app.get('/api/channels', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: "Could not read data file" });
    }
});

// POST Channels: Update the channel list
// PROTECTED: Only logged-in admins can save changes
app.post('/api/channels', checkAuth, (req, res) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ message: "Saved!" });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));