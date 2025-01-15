//routes/content.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Content creation page
router.get('/create', (req, res) => {
    res.render('content/create', { 
        title: 'Create Content',
        user: req.user 
    });
});

// Save content (handles both drafts and published)
router.post('/create', async (req, res) => {
    try {
        const { title, body, status = 'draft' } = req.body;
        const userId = 1; // TODO: Replace with actual user ID from session
        
        const result = await pool.query(
            `INSERT INTO content (user_id, title, body, status) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id`,
            [userId, title, body, status]
        );
        
        if (status === 'draft') {
            res.redirect(`/content/edit/${result.rows[0].id}`);
        } else {
            res.redirect(`/content/view/${result.rows[0].id}`);
        }
    } catch (err) {
        console.error(err);
        res.render('error', { 
            message: 'Error creating content',
            error: err 
        });
    }
});

// View content with categorization dashboard
router.get('/view/:id', async (req, res) => {
    try {
        const content = await pool.query(
            `SELECT c.*, u.username 
             FROM content c
             JOIN users u ON c.user_id = u.id
             WHERE c.id = $1`,
            [req.params.id]
        );

        const categories = await pool.query(
            `SELECT cat.*, cc.confidence_score
             FROM categories cat
             LEFT JOIN content_categories cc ON cat.id = cc.category_id
             WHERE cc.content_id = $1`,
            [req.params.id]
        );

        res.render('content/view', {
            title: content.rows[0].title,
            content: content.rows[0],
            categories: categories.rows
        });
    } catch (err) {
        console.error(err);
        res.render('error', { message: 'Content not found' });
    }
});

// Add category to content
router.post('/:id/categorize', async (req, res) => {
    try {
        const { categoryId, confidenceScore } = req.body;
        const userId = 1; // TODO: Replace with actual user ID

        await pool.query(
            `INSERT INTO content_categories 
             (content_id, category_id, user_id, confidence_score)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (content_id, category_id, user_id) 
             DO UPDATE SET confidence_score = $4`,
            [req.params.id, categoryId, userId, confidenceScore]
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to categorize content' });
    }
});

module.exports = router;
