-- schema.sql

-- Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS content_categories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS content CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Content table
CREATE TABLE content (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
    visibility VARCHAR(50) DEFAULT 'public', -- public, private, followers
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Content categorization junction table
CREATE TABLE content_categories (
    content_id INTEGER REFERENCES content(id),
    category_id INTEGER REFERENCES categories(id),
    user_id INTEGER REFERENCES users(id),
    confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (content_id, category_id, user_id)
);

-- Follows table for social features
CREATE TABLE follows (
    follower_id INTEGER REFERENCES users(id),
    following_id INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for content table
CREATE TRIGGER update_content_updated_at
    BEFORE UPDATE ON content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some default categories
INSERT INTO categories (name, description) VALUES
    ('Interesting', 'Content that captures attention and curiosity'),
    ('Important', 'Content of significant value or impact'),
    ('Insightful', 'Content that provides deep understanding'),
    ('Technical', 'Content focused on technical details or implementation'),
    ('Tutorial', 'Educational content with step-by-step guidance'),
    ('Opinion', 'Content expressing personal views or perspectives'),
    ('Research', 'Content based on systematic investigation'),
    ('Analysis', 'Content providing detailed examination of topics'),
    ('Review', 'Content evaluating or assessing something'),
    ('Summary', 'Content condensing larger works or concepts');
