const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/', async (req, res) => {
    try {
        res.render('index',{
            title: 'Memeplex',
            content: 'Welcome to Memeplex'
        });
    } catch (err) {
        console.error(err)
        res.status(500).send('Server Error')
    }
});

module.exports = router;