CREATE TABLE UserType (
    type_id VARCHAR PRIMARY KEY,
    desc VARCHAR
);

CREATE TABLE User (
    UUID VARCHAR PRIMARY KEY,
    username VARCHAR NOT NULL,
    email VARCHAR UNIQUE,
    user_type_id VARCHAR,
    FOREIGN KEY (user_type_id) REFERENCES UserType (type_id)
);

CREATE TABLE PostTemplate (
    id VARCHAR PRIMARY KEY,
    desc VARCHAR,
    has_html BOOLEAN,
    has_json BOOLEAN
);

CREATE TABLE Category (
    ID VARCHAR PRIMARY KEY,
    short_desc VARCHAR
);

CREATE TABLE Tag (
    ID VARCHAR PRIMARY KEY,
    label_id VARCHAR,
    display_name VARCHAR,
    desc VARCHAR,
    category_id VARCHAR,
    FOREIGN KEY (category_id) REFERENCES Category (ID)
);

CREATE TABLE Post (
    UUID VARCHAR PRIMARY KEY,
    post_template_id VARCHAR,
    author VARCHAR,
    markup TEXT,
    config JSONB,
    published TIMESTAMP,
    FOREIGN KEY (author) REFERENCES User (UUID),
    FOREIGN KEY (post_template_id) REFERENCES PostTemplate (id)
);

CREATE TABLE PostType (
    post_type_id VARCHAR,
    template_id VARCHAR,
    PRIMARY KEY (post_type_id, template_id),
    FOREIGN KEY (template_id) REFERENCES PostTemplate (id)
);

CREATE TABLE PostTag (
    post_uuid VARCHAR,
    tag_id VARCHAR,
    PRIMARY KEY (post_uuid, tag_id),
    FOREIGN KEY (post_uuid) REFERENCES Post (UUID),
    FOREIGN KEY (tag_id) REFERENCES Tag (ID)
);

CREATE TABLE Preferences (
    user_uuid VARCHAR,
    tag_id VARCHAR,
    PRIMARY KEY (user_uuid, tag_id),
    FOREIGN KEY (user_uuid) REFERENCES User (UUID),
    FOREIGN KEY (tag_id) REFERENCES Tag (ID)
);

CREATE TABLE Likes (
    user_uuid VARCHAR,
    post_uuid VARCHAR,
    PRIMARY KEY (user_uuid, post_uuid),
    FOREIGN KEY (user_uuid) REFERENCES User (UUID),
    FOREIGN KEY (post_uuid) REFERENCES Post (UUID)
);