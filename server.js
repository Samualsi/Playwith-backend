const express = require('express');
const fs = require('fs');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'channels.json');

// --- ADMIN CREDENTIALS (Change these!) ---
const ADMIN_USER = "admin";
const ADMIN_PASS = "12345";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'tv-app-key-789',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 } // 1 hour
}));

// Initialize file
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));

// Auth Middleware
const checkAuth = (req, res, next) => {
    if (req.session.loggedIn) next();
    else req.path.startsWith('/api/') ? res.status(401).json({ error: "No" }) : res.redirect('/login.html');
};

// API Routes
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.loggedIn = true;
        res.json({ success: true });
    } else res.status(401).json({ success: false });
});

app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

app.get('/api/channels', (req, res) => {
    res.json(JSON.parse(fs.readFileSync(DATA_FILE)));
});

app.post('/api/channels', checkAuth, (req, res) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

app.get('/admin.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'admin.html'));
});

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}/index.html`));