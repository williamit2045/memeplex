const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows[0] && await bcrypt.compare(password, result.rows[0].password_hash)) {
            req.session.userId = result.rows[0].id;
            res.redirect('/dashboard');
        } else {
            res.render('auth/login', { 
                title: 'Login',
                error: 'Invalid credentials' 
            });
        }
    } catch (err) {
        console.error(err);
        res.render('auth/login', { 
            title: 'Login',
            error: 'Login failed' 
        });
    }
});

router.get('/register', (req, res) => {
    res.render('auth/register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
            [username, email, hashedPassword]
        );
        
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.render('auth/register', { 
            title: 'Register',
            error: 'Registration failed' 
        });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
