const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware (Networking/Security)
app.use(cors()); // Allows frontend to talk to backend
app.use(express.json()); // Parses incoming JSON requests
app.use(express.static('public')); // Serves your frontend files

// Database Setup (Database Skill)
// Connects to a file-based SQLite database
const db = new sqlite3.Database('./inventory.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create table if it doesn't exist (Schema Design)
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            quantity INTEGER DEFAULT 0,
            price REAL
        )`);
    }
});

// API Routes (Programming/Backend Skill)

// 1. GET: Fetch all items
app.get('/api/products', (req, res) => {
    const sql = "SELECT * FROM products";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "success", data: rows });
    });
});

// 2. POST: Add a new item
app.post('/api/products', (req, res) => {
    const { name, category, quantity, price } = req.body;
    const sql = "INSERT INTO products (name, category, quantity, price) VALUES (?,?,?,?)";
    const params = [name, category, quantity, price];
    
    db.run(sql, params, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ 
            message: "success", 
            data: { id: this.lastID, name, category, quantity, price } 
        });
    });
});

// 3. DELETE: Remove an item
app.delete('/api/products/:id', (req, res) => {
    const sql = "DELETE FROM products WHERE id = ?";
    db.run(sql, req.params.id, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "deleted", changes: this.changes });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});