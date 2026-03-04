const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = './channels.json';

app.use(cors());
app.use(bodyParser.json());

// THIS LINE FIXES THE "CANNOT GET /" ERROR
// It serves everything inside the "public" folder automatically
app.use(express.static('public'));

// Initialize JSON file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Data API Routes
app.get('/api/channels', (req, res) => {
    const data = fs.readFileSync(DATA_FILE);
    res.json(JSON.parse(data));
});

app.post('/api/channels', (req, res) => {
    const channels = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(channels, null, 2));
    res.json({ message: "Channels saved successfully!" });
});

app.listen(PORT, () => {
    console.log(`
✅ Server is running!
📺 TV App: http://localhost:${PORT}/index.html
⚙️ Admin Panel: http://localhost:${PORT}/admin.html
    `);
});