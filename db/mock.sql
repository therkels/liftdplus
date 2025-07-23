-- USER TYPES
INSERT INTO private.user_type (type_id, descr) VALUES
    ('admin', 'Internal team/admin user'),
    ('user', 'General user');

-- USERS (Admin and Regular user)
INSERT INTO private.users (id, username, email, user_type_id, user_role)
VALUES
    ('admin_1', 'liftd+', 'liftd+@umich.edu', 'admin', 'admin'),
    ('user_1', 'jdoe', 'jdoe@umich.edu', 'user', 'user');

-- POST TEMPLATES
INSERT INTO private.post_template (id, descr, has_html, has_json) VALUES
    ('mixed_content', 'Mixed Content Block', TRUE, FALSE),
    ('carousel_block', 'Carousel Block', TRUE, FALSE),
    ('card_grid_block', 'Card Grid Block', TRUE, FALSE),
    ('longform_reader', 'Long-form Reader Block', TRUE, FALSE);

-- TAGS (Categories/Topics)
INSERT INTO private.tag (id, display_name, descr, category) VALUES
    ('sleep_rest',  'Sleep & Rest', 'Tips and advice on rest', 'topic'),
    ('stress_anx',  'Stress & Anxiety', 'Managing stress levels', 'topic'),
    ('intimacy',    'Intimacy', 'Improving relationships', 'topic');

-- TAGS (Content Types/Formats)
INSERT INTO private.tag (id, display_name, descr, category) VALUES
    ('micro_story',  'Micro Story', 'Short reflections', 'format'),
    ('blog',         'Blog Post', 'Long-form content', 'format'),
    ('carousel',     'Image Carousel', 'Horizontally-scrollable visual', 'format'),
    ('moodboard',    'Moodboard', 'Visual mood collections', 'format');

-- TAGS (Audience)
INSERT INTO private.tag (id, display_name, descr, category) VALUES
    ('first_time', 'First-Time', 'For new or first-time audiences', 'audience'),
    ('parents',    'Parents',    'For caregivers and parents', 'audience'),
    ('women',      'Women',      'Focusing on women''s wellness', 'audience'),
    ('bipoc',      'BIPOC',      'Black, Indigenous, People of Color', 'audience'),
    ('fifty_plus', '50+',        'For older adults', 'audience');

-- POSTS
INSERT INTO private.post (
    id, title, secondary_title, cover_image_url, post_template_id, author, 
    contributor_name, source, post_status, markdown, config, created_at, published_at
) VALUES
    ('post001', '3 Tips for Better Sleep', 'Sleep Journal #1', 'https://example.com/img/sleep.jpg', 'mixed_content', 'admin_1', 'LIFTD+', 'LIFTD+', 'published', '### Try these quick ideas...', NULL, '2024-06-01 10:00:00', '2024-06-01 10:05:00'),
    ('post002', 'What First-Timers Should Know', 'For Newcomers', 'https://example.com/img/newcomers.jpg', 'longform_reader', 'admin_1', 'Kenya A.', 'Expert', 'published', '## Welcome to your first steps!', NULL, '2024-06-03 09:00:00', '2024-06-03 10:15:00'),
    ('post003', 'Stress-Busters: A Moodboard', 'Coping through visuals', 'https://example.com/img/stress.jpg', 'card_grid_block', 'admin_1', 'LIFTD+', 'UGC', 'published', 'Visual approach to stress-relief.', NULL, '2024-06-05 14:20:00', '2024-06-05 17:00:00'),
    ('post004', 'Calm Nights, Visual Steps', 'Visual wind down', 'https://example.com/img/calm.jpg', 'carousel_block', 'admin_1', 'LIFTD+', 'LIFTD+', 'published', 'Slideshow for a restful night.', NULL, '2024-06-07 20:00:00', '2024-06-07 22:45:00');

-- POST_TAGS (Assigning Category, Content Type, and Audience tags)
INSERT INTO private.post_tag (post_id, tag_id) VALUES
    -- Post001: Sleep & Rest, Micro Story, First-Time
    ('post001', 'sleep_rest'),
    ('post001', 'micro_story'),
    ('post001', 'first_time'),
    -- Post002: Topic & audience for newcomers, micro_story content type
    ('post002', 'micro_story'),
    ('post002', 'first_time'),
    -- Post003: Stress, Moodboard, Parents
    ('post003', 'stress_anx'),
    ('post003', 'moodboard'),
    ('post003', 'parents'),
    -- Post004: Sleep & Rest, Carousel, 50+
    ('post004', 'sleep_rest'),
    ('post004', 'carousel'),
    ('post004', 'fifty_plus');

-- LIKES (user_1 liked three posts)
INSERT INTO private.likes (user_id, post_id) VALUES
    ('user_1', 'post001'),
    ('user_1', 'post002'),
    ('user_1', 'post003');

-- ARCHIVES (user_1 saved two posts)
INSERT INTO private.archives (post_id, user_id) VALUES
    ('post001', 'user_1'),
    ('post002', 'user_1');


INSERT INTO private.preferences (user_id, tag_id) VALUES
    ('user_1', 'sleep_rest'),
    ('user_1', 'stress_anx'),
    ('user_1', 'intimacy'),
    ('user_1', 'micro_story'),
    ('user_1', 'moodboard'),
    ('user_1', 'carousel'),
    ('user_1', 'blog'),
    ('user_1', 'first_time'),
    ('user_1', 'parents'),
    ('user_1', 'women'),
    ('user_1', 'bipoc'),
    ('user_1', 'fifty_plus');