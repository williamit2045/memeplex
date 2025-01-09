require('dotenv').config();
const express = require('express');
const { pool } = require('./config/database');

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Home route with content listing
app.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM content ORDER BY created_at DESC'
        );
        res.render('index', { 
            title: 'Memeplex',
            content: result.rows
        });
    } catch (err) {
        console.error('Error in home route:', err);
        res.render('index', { 
            title: 'Memeplex',
            content: []
        });
    }
});

// Content creation form
app.get('/create', (req, res) => {
    res.render('create');
});

// Handle content creation
app.post('/create', async (req, res) => {
    console.log('Received form data:', req.body); // Debug log
    try {
        const { title, body } = req.body;
        
        if (!title || !body) {
            console.log('Missing title or body');
            return res.redirect('/create');
        }

        const result = await pool.query(
            'INSERT INTO content (title, body, status) VALUES ($1, $2, $3) RETURNING id',
            [title, body, 'published']
        );
        
        console.log('Content created with id:', result.rows[0].id);
        res.redirect('/');
    } catch (err) {
        console.error('Error creating content:', err);
        res.redirect('/create');
    }
});

// View single content
app.get('/view/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM content WHERE id = $1',
            [req.params.id]
        );
        
        if (!result.rows[0]) {
            return res.redirect('/');
        }
        
        res.render('view', { content: result.rows[0] });
    } catch (err) {
        console.error('Error viewing content:', err);
        res.redirect('/');
    }
});

// Add a tag to content
app.post('/tag/:contentId', async (req, res) => {
    try {
        const { contentId } = req.params;
        const { tagName } = req.body;

        if (!tagName?.trim()) {
            return res.redirect(`/view/${contentId}`);
        }

        await pool.query(
            'INSERT INTO tags (name, content_id) VALUES ($1, $2) ON CONFLICT (name, content_id) DO NOTHING',
            [tagName.trim().toLowerCase(), contentId]
        );

        res.redirect(`/view/${contentId}`);
    } catch (err) {
        console.error('Error adding tag:', err);
        res.redirect(`/view/${contentId}`);
    }
});

// View single content with categories
app.get('/view/:id', async (req, res) => {
    try {
        // Get the content
        const contentResult = await pool.query(
            'SELECT * FROM content WHERE id = $1',
            [req.params.id]
        );

        if (!contentResult.rows[0]) {
            console.log('Content not found');
            return res.redirect('/');
        }

        // Get categories for this content
        const categoriesResult = await pool.query(
            `SELECT DISTINCT c.name, c.id 
             FROM categories c
             LEFT JOIN content_categories cc ON c.id = cc.category_id
             WHERE cc.content_id = $1`,
            [req.params.id]
        );

        console.log('Categories found:', categoriesResult.rows); // Debug log

        // Render with explicit empty array if no categories
        res.render('view', { 
            content: contentResult.rows[0],
            categories: categoriesResult.rows || []
        });
    } catch (err) {
        console.error('Error viewing content:', err);
        res.redirect('/');
    }
});

app.get('/view/:id', async (req, res) => {
    try {
        const contentResult = await pool.query(
            'SELECT * FROM content WHERE id = $1',
            [req.params.id]
        );

        if (!contentResult.rows[0]) {
            return res.redirect('/');
        }

        const categoriesResult = await pool.query(
            `SELECT c.name, c.id
            FROM categories c
            JOIN content_categories cc ON c.id = cc.category_id
            WHERE cc.content_id = $1`,
            [req.params.id]
        );

        res.render('view', {
            content: contentResult.rows[0],
            categories: categoriesResult.rows
        });
    } catch(err){
        console.error('Error viewing content:', err);
        res.redirect('/');
    }
});
        
        // Add a category to content
        app.post('/categorize/:contentId', async (req, res) => {
            try {
                const { contentId } = req.params;
                const { categoryName } = req.body;

                if(!categoryName?.trim()) {
                    return res.redirect(`/view/${contentid}`);
                }

                //Firsrt, insert or get the category
                const categoryResult = await pool.query(
                    `INSERT INTO categories (name)
                    VALUES ($1)
                    ON CONFLICT (name) DO UPDATE SET name = $1
                    RETURNING id`
                    [categoryName.trim().toLowerCase()]
                );

                const cotegoryId = categoryResult.rows[0].id;

                // Then link it to the content
                await pool.query(
                    `INSEERT INTO content_categories (content_id, category_id, user_id)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (content_id, category_id, user_id) DO NOTHING`,
                    [contentId, categoryId, 1] // Using default user_id 1 for now
                );

                res.redirect(`/view${contentId}`);
            } catch (err) {
                console.error('Error adding category:', err);
                res.redirect(`/view/${contentId}`);
            }
        });

/*

        const tagsResult = await pool.query(
            'SELECT * FROM tags WHERE content_id = $1 ORDER BY created_at DESC',
            [req.params.id]
        );

        res.render('view', { 
            content: contentResult.rows[0],
            tags: tagsResult.rows
        });
    } catch (err) {
        console.error('Error viewing content:', err);
        res.redirect('/');
    }
});

// Add a route to view content by tag
app.get('/tag/:tagName', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT c.* 
             FROM content c 
             JOIN tags t ON c.id = t.content_id 
             WHERE t.name = $1 
             ORDER BY c.created_at DESC`,
            [req.params.tagName.toLowerCase()]
        );

        res.render('index', {
            title: `Content tagged "${req.params.tagName}"`,
            content: result.rows
        });
    } catch (err) {
        console.error('Error viewing tagged content:', err);
        res.redirect('/');
    }
});
*/

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
