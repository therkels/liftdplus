-- USERS AND USER TYPES
CREATE TABLE UserType (
    type_id VARCHAR PRIMARY KEY,
    descr   TEXT
);

CREATE TABLE "User" (
    UUID VARCHAR PRIMARY KEY,
    username VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    user_type_id VARCHAR NOT NULL,
    FOREIGN KEY (user_type_id) REFERENCES UserType(type_id)
);

-- POST TEMPLATES
CREATE TABLE PostTemplate (
    id VARCHAR PRIMARY KEY, -- Human Readable ID
    descr TEXT,
    has_html BOOLEAN,
    has_json BOOLEAN
);

-- POSTS WITH REFERENCE TO AUTHOR AND TEMPLATE
CREATE TABLE Post (
    UUID VARCHAR PRIMARY KEY,
    post_template_id VARCHAR NOT NULL,
    author VARCHAR NOT NULL,
    markup TEXT,
    config JSONB,
    published TIMESTAMP,
    FOREIGN KEY (post_template_id) REFERENCES PostTemplate(id),
    FOREIGN KEY (author) REFERENCES "User"(UUID)
);

-- POST TYPES CAN USE MULTIPLE TEMPLATES (COMPOSITE PK!)
CREATE TABLE PostType (
    post_type_id VARCHAR,
    template_id VARCHAR,
    descr TEXT,
    PRIMARY KEY (post_type_id, template_id),
    FOREIGN KEY (template_id) REFERENCES PostTemplate(id)
);

-- TAGS AND CATEGORIES
CREATE TABLE Category (
    ID VARCHAR PRIMARY KEY,
    short_desc VARCHAR
);

CREATE TABLE Tag (
    ID VARCHAR PRIMARY KEY,
    label_id VARCHAR NOT NULL,      -- FK to Category
    display_name VARCHAR,
    descr TEXT,
    FOREIGN KEY (label_id) REFERENCES Category(ID)
);

-- JOIN TABLE FOR POST <-> TAG (MANY-TO-MANY)
CREATE TABLE PostTag (
    post_uuid VARCHAR,
    tag_id VARCHAR,
    PRIMARY KEY (post_uuid, tag_id),
    FOREIGN KEY (post_uuid) REFERENCES Post(UUID) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tag(ID) ON DELETE CASCADE
);

-- PREFERENCES: USER <-> TAG (MANY-TO-MANY)
CREATE TABLE Preferences (
    user_uuid VARCHAR,
    tag_id VARCHAR,
    PRIMARY KEY (user_uuid, tag_id),
    FOREIGN KEY (user_uuid) REFERENCES "User"(UUID) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tag(ID) ON DELETE CASCADE
);

-- USERS CAN LIKE MANY POSTS
CREATE TABLE Likes (
    user_uuid VARCHAR,
    post_uuid VARCHAR,
    PRIMARY KEY (user_uuid, post_uuid),
    FOREIGN KEY (user_uuid) REFERENCES "User"(UUID) ON DELETE CASCADE,
    FOREIGN KEY (post_uuid) REFERENCES Post(UUID) ON DELETE CASCADE
);