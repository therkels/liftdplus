CREATE SCHEMA IF NOT EXISTS private;

SET search_path TO private;

DROP TABLE IF EXISTS private.Likes CASCADE;
DROP TABLE IF EXISTS private.Preferences CASCADE;
DROP TABLE IF EXISTS private.PostTag CASCADE;
DROP TABLE IF EXISTS private.Tag CASCADE;
DROP TABLE IF EXISTS private.Category CASCADE;
DROP TABLE IF EXISTS private.PostType CASCADE;
DROP TABLE IF EXISTS private.Post CASCADE;
DROP TABLE IF EXISTS private.PostTemplate CASCADE;
DROP TABLE IF EXISTS private.Users CASCADE;
DROP TABLE IF EXISTS private.UserType CASCADE;



-- USERS AND USER TYPES
CREATE TABLE private.UserType (
    type_id VARCHAR PRIMARY KEY,
    descr   TEXT
);

CREATE TABLE private.Users (
    UUID VARCHAR PRIMARY KEY,
    username VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    user_type_id VARCHAR NOT NULL,
    FOREIGN KEY (user_type_id) REFERENCES private.UserType(type_id)
);

-- POST TEMPLATES
CREATE TABLE private.PostTemplate (
    id VARCHAR PRIMARY KEY, -- Human Readable ID
    descr TEXT,
    has_html BOOLEAN,
    has_json BOOLEAN
);

-- POSTS WITH REFERENCE TO AUTHOR AND TEMPLATE
CREATE TABLE private.Post (
    UUID VARCHAR PRIMARY KEY,
    post_template_id VARCHAR NOT NULL,
    author VARCHAR NOT NULL,
    contributor_name VARCHAR NOT NULL,
    source VARCHAR NOT NULL,
    post_status VARCHAR NOT NULL DEFAULT 'draft' CHECK (
        post_status IN ('draft', 'published', 'scheduled', 'archived', 'deleted', 'pending_review')
    ),
    markup TEXT,
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    FOREIGN KEY (post_template_id) REFERENCES private.PostTemplate(id),
    FOREIGN KEY (author) REFERENCES private.Users(UUID)
);

-- POST TYPES CAN USE MULTIPLE TEMPLATES (COMPOSITE PK!)
CREATE TABLE private.PostType (
    post_type_id VARCHAR,
    template_id VARCHAR,
    descr TEXT,
    PRIMARY KEY (post_type_id, template_id),
    FOREIGN KEY (template_id) REFERENCES private.PostTemplate(id)
);

-- TAGS AND CATEGORIES
CREATE TABLE private.Category (
    ID VARCHAR PRIMARY KEY,
    short_desc VARCHAR
);

CREATE TABLE private.Tag (
    ID VARCHAR PRIMARY KEY,
    label_id VARCHAR NOT NULL,      -- FK to Category
    display_name VARCHAR,
    descr TEXT,
    FOREIGN KEY (label_id) REFERENCES private.Category(ID)
);

-- JOIN TABLE FOR POST <-> TAG (MANY-TO-MANY)
CREATE TABLE private.PostTag (
    post_uuid VARCHAR,
    tag_id VARCHAR,
    PRIMARY KEY (post_uuid, tag_id),
    FOREIGN KEY (post_uuid) REFERENCES private.Post(UUID) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES private.Tag(ID) ON DELETE CASCADE
);

-- PREFERENCES: USER <-> TAG (MANY-TO-MANY)
CREATE TABLE private.Preferences (
    user_uuid VARCHAR,
    tag_id VARCHAR,
    PRIMARY KEY (user_uuid, tag_id),
    FOREIGN KEY (user_uuid) REFERENCES private.Users(UUID) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES private.Tag(ID) ON DELETE CASCADE
);

-- USERS CAN LIKE MANY POSTS
CREATE TABLE private.Likes (
    user_uuid VARCHAR,
    post_uuid VARCHAR,
    PRIMARY KEY (user_uuid, post_uuid),
    FOREIGN KEY (user_uuid) REFERENCES private.Users(UUID) ON DELETE CASCADE,
    FOREIGN KEY (post_uuid) REFERENCES private.Post(UUID) ON DELETE CASCADE
);

