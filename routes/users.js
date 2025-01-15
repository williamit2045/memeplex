//routes/users.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// User profile page
router.get('/:username', async (req, res) => {
    try {
        // Get user info
        const userResult = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [req.params.username]
        );

        if (!userResult.rows[0]) {
            return res.render('error', { message: 'User not found' });
        }

        const user = userResult.rows[0];

        // Get user's content
        const contentResult = await pool.query(
            `SELECT c.*, 
                    COUNT(DISTINCT cc.category_id) as category_count,
                    COUNT(DISTINCT l.user_id) as like_count
             FROM content c
             LEFT JOIN content_categories cc ON c.id = cc.content_id
             LEFT JOIN likes l ON c.id = l.content_id
             WHERE c.user_id = $1 AND c.status = 'published'
             GROUP BY c.id
             ORDER BY c.created_at DESC`,
            [user.id]
        );

        // Get categorization insights
        const insightsResult = await pool.query(
            `SELECT cat.name, 
                    COUNT(*) as use_count,
                    AVG(cc.confidence_score) as avg_confidence
             FROM content_categories cc
             JOIN categories cat ON cc.category_id = cat.id
             WHERE cc.user_id = $1
             GROUP BY cat.id
             ORDER BY use_count DESC
             LIMIT 10`,
            [user.id]
        );

        // Get social stats
        const socialStats = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM follows WHERE following_id = $1) as followers_count,
                (SELECT COUNT(*) FROM follows WHERE follower_id = $1) as following_count`,
            [user.id]
        );

        res.render('users/profile', {
            title: `${user.username}'s Profile`,
            user,
            content: contentResult.rows,
            insights: insightsResult.rows,
            socialStats: socialStats.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.render('error', { message: 'Error loading profile' });
    }
});

module.exports = router;
