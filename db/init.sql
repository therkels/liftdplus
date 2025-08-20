CREATE SCHEMA IF NOT EXISTS private;

SET search_path TO private;

DROP TABLE IF EXISTS private.likes CASCADE;
DROP TABLE IF EXISTS private.preferences CASCADE;
DROP TABLE IF EXISTS private.post_tag CASCADE;
DROP TABLE IF EXISTS private.tag CASCADE;
DROP TABLE IF EXISTS private.category CASCADE;
DROP TABLE IF EXISTS private.post_type CASCADE;
DROP TABLE IF EXISTS private.post CASCADE;
DROP TABLE IF EXISTS private.posttemplate CASCADE;
DROP TABLE IF EXISTS private.users CASCADE;
DROP TABLE IF EXISTS private.usertype CASCADE;
DROP TABLE IF EXISTS private.user_type CASCADE;
DROP TABLE IF EXISTS private.post_template CASCADE;
DROP TABLE IF EXISTS private.archives CASCADE;

CREATE TABLE private.user_type (
    type_id VARCHAR PRIMARY KEY,
    descr VARCHAR NOT NULL
);

CREATE TABLE private.users (
    id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR NOT NULL,
    user_type_id VARCHAR NOT NULL,
    profile_icon_url VARCHAR,
    user_role VARCHAR NOT NULL DEFAULT 'user' CHECK (
        user_role IN ('user','admin')
    ),
    primary key (id),
    FOREIGN KEY (user_type_id) REFERENCES private.user_type(type_id)
);

-- POST TEMPLATES
CREATE TABLE private.post_template (
    id varchar PRIMARY KEY, -- Human Readable ID
    descr TEXT,
    has_markdown BOOLEAN,
    has_json BOOLEAN
);

-- POSTS WITH REFERENCE TO AUTHOR AND TEMPLATE
CREATE TABLE private.post (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    secondary_title VARCHAR NOT NULL,
    cover_image_url VARCHAR,
    post_template_id VARCHAR NOT NULL,
    author uuid NOT NULL,
    contributor_name VARCHAR NOT NULL,
    source VARCHAR NOT NULL,
    post_status VARCHAR NOT NULL DEFAULT 'draft' CHECK (
        post_status IN ('draft', 'published', 'scheduled', 'archived', 'deleted', 'pending_review')
    ),
    markdown TEXT,
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    FOREIGN KEY (post_template_id) REFERENCES private.post_template(id),
    FOREIGN KEY (author) REFERENCES private.users(id)
);

CREATE TABLE private.archives (
    post_id int,
    user_id uuid,
    category varchar not null,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (user_id) REFERENCES private.users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES private.post(id) ON DELETE CASCADE
);


CREATE TABLE private.tag (
    id VARCHAR PRIMARY KEY,
    display_name VARCHAR,
    descr TEXT,
    category VARCHAR CHECK (
        category IN ('topic','format','audience')
    )
);

-- JOIN TABLE FOR POST <-> TAG (MANY-TO-MANY)
CREATE TABLE private.post_tag (
    post_id int,
    tag_id varchar,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES private.post(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES private.tag(id) ON DELETE CASCADE
);

-- PREFERENCES: USER <-> TAG (MANY-TO-MANY)
CREATE TABLE private.preferences (
    user_id uuid,
    tag_id varchar,
    PRIMARY KEY (user_id, tag_id),
    FOREIGN KEY (user_id) REFERENCES private.users(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES private.tag(id) ON DELETE CASCADE
);

-- USERS CAN LIKE MANY POSTS
CREATE TABLE private.likes (
    user_id uuid,
    post_id int,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES private.users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES private.post(id) ON DELETE CASCADE
);

