//routes/index.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ------------------------------------
// 🏠 Home Page Route
// ------------------------------------
router.get('/', async (req, res) => {
    if (!pool) {
        console.warn('⚠️ Database connection is not configured. Returning sample content.');
        return res.render('home', {
            title: 'Home - Memeplex',
            content: [],
            pageStyle: 'home'
        });
    }

    try {
        const result = await pool.query('SELECT * FROM content ORDER BY created_at DESC');
        res.render('home', { title: 'Home - Memeplex', content: result.rows, pageStyle: 'home' });
    } catch (err) {
        console.error('Error fetching content:', err);
        res.render('error', { message: 'Error loading the homepage' });
    }
});

// Example of a route using `router` instead of `app`
router.get('/search', async (req, res) => {
    const { query } = req.query;
    try {
        const result = await pool.query(
            `SELECT * FROM content WHERE title ILIKE $1 OR body ILIKE $1`,
            [`%${query}%`]
        );
        res.render('index', { title: `Search Results for ${query}`, content: result.rows });
    } catch (err) {
        console.error('Error searching content:', err);
        res.render('index', { title: 'Search Error', content: [] });
    }
});

// ------------------------------------
// 🌂 Tags Page Route
// ------------------------------------
router.get('/tags', async (req, res) => {
    if (!pool) {
        console.warn('⚠️ Database connection is not configured. Returning sample tags.');
        return res.render('tags', {
            title: 'Tags - Memeplex',
            tags: [],
            pageStyle: 'tags'
        });
    }

    try {
        const tags = await pool.query('SELECT * FROM tags ORDER BY name ASC');
        res.render('tags', { title: 'Tags - Memeplex', tags: tags.rows, pageStyle: 'tags' });
    } catch (err) {
        console.error('Error fetching tags:', err);
        res.render('error', { message: 'Error loading tags' });
    }
});

// ------------------------------------
// 🗰 Blogs Page Route
// ------------------------------------
router.get('/blogs', async (req, res) => {
    if (!pool) {
        console.warn('⚠️ Database connection is not configured. Returning sample blogs.');
        return res.render('blogs', {
            title: 'Blogs - Memeplex',
            content: [],
            pageStyle: 'blogs'
        });
    }

    try {
        const result = await pool.query(`
            SELECT content.*, COUNT(content_tags.tag_id) AS tag_count
            FROM content
            LEFT JOIN content_tags ON content.id = content_tags.content_id
            GROUP BY content.id
            ORDER BY tag_count DESC
        `);
        res.render('blogs', { title: 'Blogs - Memeplex', content: result.rows, pageStyle: 'blogs' });
    } catch (err) {
        console.error('Error loading blogs:', err);
        res.render('error', { message: 'Error loading blogs' });
    }
});

// 🔄 Blogs Sorting Route
router.get('/blogs/sort', async (req, res) => {
    try {
        const { sortBy } = req.query;
        let query;

        switch (sortBy) {
            case 'alphabetical':
                query = 'SELECT * FROM content ORDER BY title ASC';
                break;
            case 'recent':
                query = 'SELECT * FROM content ORDER BY created_at DESC';
                break;
            default:
                query = `
                    SELECT content.*, COUNT(content_tags.tag_id) AS tag_count
                    FROM content
                    LEFT JOIN content_tags ON content.id = content_tags.content_id
                    GROUP BY content.id
                    ORDER BY tag_count DESC
                `;
                break;
        }

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error sorting blogs:', err);
        res.status(500).json({ message: 'Error sorting blogs' });
    }
});

// ------------------------------------
// 🔍 Route to Handle Tag Search for Dropdown
// ------------------------------------
router.get('/tags/search/:query', async (req, res) => {
    try {
        const query = req.params.query.toLowerCase();
        const tags = await pool.query('SELECT * FROM tags WHERE LOWER(name) LIKE $1 LIMIT 10', [`%${query}%`]);
        res.json(tags.rows);
    } catch (err) {
        console.error('Error fetching tags:', err);
        res.status(500).send('Error fetching tags');
    }
});

// ------------------------------------
// 🖍️ Content Creation Form Route
// ------------------------------------
router.get('/create', (req, res) => {
    res.render('create', { title: 'Create Content', pageStyle: 'create' });
});

// ------------------------------------
// 📤 Handle Content Creation (POST)
// ------------------------------------
router.post('/create', async (req, res) => {
    try {
        const { title, body } = req.body;

        // Validate input
        if (!title || !body) {
            console.warn('Missing title or body');
            return res.redirect('/create');
        }

        // Insert new content into the database
        const result = await pool.query(
            'INSERT INTO content (title, body, status) VALUES ($1, $2, $3) RETURNING id',
            [title, body, 'published']
        );

        // Redirect to the newly created content page
        res.redirect(`/view/${result.rows[0].id}`);
    } catch (err) {
        console.error('Error creating content:', err);
        res.redirect('/create');
    }
});

// ------------------------------------
// 🔎 View Single Content with Tags
// ------------------------------------
router.get('/view/:id', async (req, res) => {
    try {
        const contentResult = await pool.query('SELECT * FROM content WHERE id = $1', [req.params.id]);
        const tagsResult = await pool.query(
            'SELECT t.name FROM tags t JOIN content_tags ct ON t.id = ct.tag_id WHERE ct.content_id = $1',
            [req.params.id]
        );

        // Render the view page with the content and associated tags
        res.render('view', {
            title: contentResult.rows[0].title,
            content: contentResult.rows[0],
            tags: tagsResult.rows
        });
    } catch (err) {
        console.error('Error viewing content:', err);
        res.redirect('/blogs');
    }
});

// ------------------------------------
// 🔖 Route to Get All Blogs Under a Specific Tag
// ------------------------------------
router.get('/tags/:id', async (req, res) => {
    const tagId = parseInt(req.params.id); // Convert to integer

    if (isNaN(tagId)) {
        // If tagId is not a valid number, return an error
        return res.status(400).render('error', { message: 'Invalid tag ID' });
    }

    try {
        // Query to get the specific tag
        const tagResult = await pool.query('SELECT * FROM tags WHERE id = $1', [tagId]);

        // If the tag doesn't exist, render a 404 error page
        if (tagResult.rows.length === 0) {
            return res.status(404).render('error', { message: 'Tag not found' });
        }

        // Query to get all blogs associated with the tag
        const blogsResult = await pool.query(`
            SELECT content.*, COUNT(ct2.tag_id) AS tag_count
            FROM content_tags ct
            JOIN content ON ct.content_id = content.id
            LEFT JOIN content_tags ct2 ON content.id = ct2.content_id
            WHERE ct.tag_id = $1
            GROUP BY content.id
            ORDER BY content.created_at DESC
        `, [tagId]);

        // Render the tagged-blogs page
        res.render('tagged-blogs', {
            title: `${tagResult.rows[0].name} - Tagged Blogs`,
            tag: tagResult.rows[0],
            blogs: blogsResult.rows,
            pageStyle: 'blogs'
        });
    } catch (err) {
        console.error('Error fetching blogs for tag:', err);
        res.status(500).render('error', { message: 'Error fetching tagged blogs' });
    }
});

// ------------------------------------
// 📤 Handle Tag Submission (POST)
// ------------------------------------
router.post('/tag/:id', async (req, res) => {
    try {
        const contentId = req.params.id;
        const tags = req.body.tags.split(',');

        // Loop through tags and associate them with the content
        for (const tag of tags) {
            // Check if the tag already exists
            let tagResult = await pool.query('SELECT id FROM tags WHERE name = $1', [tag]);

            if (tagResult.rows.length === 0) {
                // Insert new tag if it doesn't exist
                tagResult = await pool.query('INSERT INTO tags (name) VALUES ($1) RETURNING id', [tag]);
            }

            const tagId = tagResult.rows[0].id;

            // Associate the tag with the content
            await pool.query('INSERT INTO content_tags (content_id, tag_id) VALUES ($1, $2)', [contentId, tagId]);
        }

        // Redirect back to the content view page
        res.redirect(`/view/${contentId}`);
    } catch (err) {
        console.error('Error adding tags:', err);
        res.redirect(`/view/${req.params.id}`);
    }
});

// ------------------------------------
// 🔍 Route to Handle Tag Search for Dropdown
// ------------------------------------
router.get('/tags/search', async (req, res) => {
    const { query } = req.query;

    if (!query || query.trim() === '') {
        return res.json([]);
    }

    try {
        // Search for tags matching the query
        const tagsResult = await pool.query(
            'SELECT * FROM tags WHERE LOWER(name) LIKE $1 LIMIT 10',
            [`%${query.toLowerCase()}%`]
        );
        res.json(tagsResult.rows);
    } catch (err) {
        console.error('Error searching tags:', err);
        res.status(500).json({ error: 'Error searching tags' });
    }
});

module.exports = router;
