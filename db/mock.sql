-- User Types
INSERT INTO private.UserType (type_id, descr) VALUES
('admin', 'Internal Team Administrator'),
('regular', 'Regular User');

-- Users (Admin only for MVP)
INSERT INTO private.Users (UUID, username, email, user_type_id) VALUES
('u1', 'kenyaa', 'kenya.a@example.com', 'admin'),
('u2', 'liftdplus', 'team@liftdplus.com', 'admin');

INSERT INTO private.PostTemplate (id, descr, has_html, has_json) VALUES
('mixed_content', 'Mixed Content Block for Micro Stories, Quick Tips', TRUE, FALSE),
('carousel_block',  'Carousel Block for visual explainers', TRUE, TRUE),
('card_grid', 'Card Grid Block for mood boards, collections', TRUE, TRUE),
('longform_reader', 'Long-form Reader Block for essays/guides', TRUE, FALSE);

INSERT INTO private.PostType (post_type_id, template_id, descr) VALUES
('micro_story', 'mixed_content', 'Micro-stories or personal reflections'),
('blog_post', 'longform_reader', 'Blog-style informative guides'),
('image_carousel', 'carousel_block', 'Visual storytelling carousel format'),
('grid_content', 'card_grid', 'Mood boards/themed visual collections');

-- Categories (wellness-related themes)
INSERT INTO private.Category (ID, short_desc) VALUES
('sleep', 'Sleep & Rest'),
('anxiety', 'Stress & Anxiety'),
('intimacy', 'Intimacy');

-- Tags: Each tag links to a category + additional tag for Content Type, Audience
INSERT INTO private.Tag (ID, label_id, display_name, descr) VALUES
('t1', 'sleep', 'Sleep & Rest', 'Content about improving sleep and restfulness'),
('t2', 'anxiety', 'Stress & Anxiety', 'Managing daily stress and anxiety'),
('t3', 'intimacy', 'Intimacy', 'Supporting intimate relationships'),

-- Content Type Tags
('ct_micro_story', 'sleep', 'Micro Story', 'Short personal reflection format'),
('ct_guide', 'anxiety', 'Guide', 'Blog-style or narrative guide format'),
('ct_moodboard', 'intimacy', 'Moodboard', 'Collection or moodboard layout'),

-- Audience Tags
('aud_parents', 'sleep', 'Parents', 'Content for parents'),
('aud_first_time', 'anxiety', 'First-Time', 'For first-time users'),
('aud_women', 'intimacy', 'Women', 'Content intended for women');

-- Micro Story
INSERT INTO private.Post (UUID, post_template_id, author, contributor_name, source, post_status, markup, config)
VALUES (
  'p1', 'mixed_content', 'u1', 'Kenya A.', 'LIFTD+', 'published',
  'Title: “My Nighttime Routine”<br>Body: “Here’s how I wind down for restful sleep…”', NULL
);

-- Blog-style post
INSERT INTO private.Post (UUID, post_template_id, author, contributor_name, source, post_status, markup, config)
VALUES (
  'p2', 'longform_reader', 'u2', 'LIFTD+', 'LIFTD+', 'published',
  'Title: “Understanding Stress Triggers”<br>Body: “Stress hits at the worst times. Here’s a guide to coping...”', NULL
);

-- Image Carousel
INSERT INTO private.Post (UUID, post_template_id, author, contributor_name, source, post_status, markup, config)
VALUES (
  'p3', 'carousel_block', 'u1', 'Kenya A.', 'Expert Contributor', 'published',
  'Title: “Bedtime Products to Try”<br>(Carousel images go here)', '{"images": [{"url": "img1.jpg","caption": "Tealight Candles"},{"url": "img2.jpg","caption": "Aromatherapy Spray"}]}'
);

-- Grid-style Moodboard
INSERT INTO private.Post (UUID, post_template_id, author, contributor_name, source, post_status, markup, config)
VALUES (
  'p4', 'card_grid', 'u2', 'LIFTD+', 'LIFTD+', 'published',
  'Moodboard: “Winding Down”<br>Tiles: relaxing scenes', '{"tiles": [{"label": "Herbal Tea"},{"label": "Soft Music"}]}'
);

-- p1: Micro Story (Sleep, Micro Story, Parents)
INSERT INTO private.PostTag (post_uuid, tag_id) VALUES
('p1', 't1'),
('p1', 'ct_micro_story'),
('p1', 'aud_parents');

-- p2: Blog (Anxiety category, Guide, First-Time)
INSERT INTO private.PostTag (post_uuid, tag_id) VALUES
('p2', 't2'),
('p2', 'ct_guide'),
('p2', 'aud_first_time');

-- p3: Image Carousel (Sleep, Moodboard, Women)
INSERT INTO private.PostTag (post_uuid, tag_id) VALUES
('p3', 't1'),
('p3', 'ct_moodboard'),
('p3', 'aud_women');

-- p4: Grid/Moodboard (Intimacy, Moodboard, Parents)
INSERT INTO private.PostTag (post_uuid, tag_id) VALUES
('p4', 't3'),
('p4', 'ct_moodboard'),
('p4', 'aud_parents');

-- Kenya liked her own post and LIFTD+'s grid
INSERT INTO private.Likes (user_uuid, post_uuid) VALUES
('u1', 'p1'),
('u1', 'p4');

-- LIFTD+ team likes all posts (as placeholder)
INSERT INTO private.Likes (user_uuid, post_uuid) VALUES
('u2', 'p1'),
('u2', 'p2'),
('u2', 'p3'),
('u2', 'p4');