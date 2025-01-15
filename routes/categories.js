
//routes/categories.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// View all categories
router.get('/', async (req, res) => {
    try {
        const categories = await pool.query(
            `SELECT c.*, 
                    COUNT(DISTINCT cc.content_id) as content_count,
                    AVG(cc.confidence_score) as avg_confidence
             FROM categories c
             LEFT JOIN content_categories cc ON c.id = cc.category_id
             GROUP BY c.id
             ORDER BY content_count DESC`
        );

        res.render('categories/index', {
            title: 'Categories',
            categories: categories.rows
        });
    } catch (err) {
        console.error(err);
        res.render('error', { message: 'Error loading categories' });
    }
});

// View content in a category
router.get('/:id', async (req, res) => {
    try {
        const category = await pool.query(
            'SELECT * FROM categories WHERE id = $1',
            [req.params.id]
        );

        const content = await pool.query(
            `SELECT c.*, u.username,
                    cc.confidence_score,
                    COUNT(DISTINCT l.user_id) as like_count
             FROM content c
             JOIN content_categories cc ON c.id = cc.content_id
             JOIN users u ON c.user_id = u.id
             LEFT JOIN likes l ON c.id = l.content_id
             WHERE cc.category_id = $1 AND c.status = 'published'
             GROUP BY c.id, u.username, cc.confidence_score
             ORDER BY cc.confidence_score DESC`,
            [req.params.id]
        );

        res.render('categories/view', {
            title: category.rows[0].name,
            category: category.rows[0],
            content: content.rows
        });
    } catch (err) {
        console.error(err);
        res.render('error', { message: 'Category not found' });
    }
});

module.exports = router;
