INSERT INTO private.user_type (type_id, descr) VALUES
    ('admin', 'Internal team/admin user'),
    ('viewer', 'General user');
INSERT INTO private.users (id, username, user_type_id, user_role) VALUES
    ('00000000-0000-0000-0000-000000000001', 'liftd+', 'admin', 'admin'),
    ('00000000-0000-0000-0000-000000000002', 'jdoe', 'viewer', 'user');

INSERT INTO private.post_template (id, descr, has_html, has_json) VALUES
    ('carousel_block', 'Carousel Block', TRUE, TRUE),
    ('blog_style', 'Long-form Reader Block', TRUE, FALSE);


INSERT INTO private.tag (id, display_name, descr, category) VALUES
    ('sleep_rest',  'Sleep & Rest', 'Tips and advice on rest', 'topic'),
    ('stress_anx',  'Stress & Anxiety', 'Managing stress levels', 'topic'),
    ('intimacy',    'Intimacy', 'Improving relationships', 'topic');

INSERT INTO private.tag (id, display_name, descr, category) VALUES
    ('micro_story',  'Micro Story', 'Short reflections', 'format'),
    ('blog',         'Blog Post', 'Long-form content', 'format'),
    ('carousel',     'Image Carousel', 'Horizontally-scrollable visual', 'format'),
    ('moodboard',    'Moodboard', 'Visual mood collections', 'format');

INSERT INTO private.tag (id, display_name, descr, category) VALUES
    ('first_time', 'First-Time', 'For new or first-time audiences', 'audience'),
    ('parents',    'Parents',    'For caregivers and parents', 'audience'),
    ('women',      'Women',      'Focusing on women''s wellness', 'audience'),
    ('bipoc',      'BIPOC',      'Black, Indigenous, People of Color', 'audience'),
    ('fifty_plus', '50+',        'For older adults', 'audience');

INSERT INTO private.post (
    id, title, secondary_title, cover_image_url, post_template_id, author, 
    contributor_name, source, post_status, markdown, config, created_at, published_at
) VALUES
    (1, '3 Tips for Better Sleep', 'Sleep Journal #1', 'https://example.com/img/sleep.jpg', 'mixed_content', '00000000-0000-0000-0000-000000000001', 'LIFTD+', 'LIFTD+', 'published', '### Try these quick ideas...', NULL, '2024-06-01 10:00:00', '2024-06-01 10:05:00'),
    (2, 'What First-Timers Should Know', 'For Newcomers', 'https://example.com/img/newcomers.jpg', 'longform_reader', '00000000-0000-0000-0000-000000000001', 'Kenya A.', 'Expert', 'published', '## Welcome to your first steps!', NULL, '2024-06-03 09:00:00', '2024-06-03 10:15:00'),
    (3, 'Stress-Busters: A Moodboard', 'Coping through visuals', 'https://example.com/img/stress.jpg', 'card_grid_block', '00000000-0000-0000-0000-000000000001', 'LIFTD+', 'UGC', 'published', 'Visual approach to stress-relief.', NULL, '2024-06-05 14:20:00', '2024-06-05 17:00:00'),
    (4, 'Calm Nights, Visual Steps', 'Visual wind down', 'https://example.com/img/calm.jpg', 'carousel_block', '00000000-0000-0000-0000-000000000001', 'LIFTD+', 'LIFTD+', 'published', 'Slideshow for a restful night.', NULL, '2024-06-07 20:00:00', '2024-06-07 22:45:00');

-- Post 1: Sleep & Rest, Micro Story, First-Time
INSERT INTO private.post_tag (post_id, tag_id) VALUES
    (1, 'sleep_rest'),
    (1, 'micro_story'),
    (1, 'first_time');

-- Post 2: Micro Story, First-Time
INSERT INTO private.post_tag (post_id, tag_id) VALUES
    (2, 'micro_story'),
    (2, 'first_time');

-- Post 3: Stress & Anxiety, Moodboard, Parents
INSERT INTO private.post_tag (post_id, tag_id) VALUES
    (3, 'stress_anx'),
    (3, 'moodboard'),
    (3, 'parents');

-- Post 4: Sleep & Rest, Carousel, Fifty Plus
INSERT INTO private.post_tag (post_id, tag_id) VALUES
    (4, 'sleep_rest'),
    (4, 'carousel'),
    (4, 'fifty_plus');

INSERT INTO private.likes (user_id, post_id) VALUES
    ('00000000-0000-0000-0000-000000000002', 1),
    ('00000000-0000-0000-0000-000000000002', 2),
    ('00000000-0000-0000-0000-000000000002', 3);

INSERT INTO private.archives (post_id, user_id, category) VALUES
    (1, '00000000-0000-0000-0000-000000000002', 'saved'),
    (2, '00000000-0000-0000-0000-000000000002', 'saved');

INSERT INTO private.preferences (user_id, tag_id) VALUES
    ('00000000-0000-0000-0000-000000000002', 'sleep_rest'),
    ('00000000-0000-0000-0000-000000000002', 'stress_anx'),
    ('00000000-0000-0000-0000-000000000002', 'intimacy'),
    ('00000000-0000-0000-0000-000000000002', 'micro_story'),
    ('00000000-0000-0000-0000-000000000002', 'moodboard'),
    ('00000000-0000-0000-0000-000000000002', 'carousel'),
    ('00000000-0000-0000-0000-000000000002', 'blog'),
    ('00000000-0000-0000-0000-000000000002', 'first_time'),
    ('00000000-0000-0000-0000-000000000002', 'parents'),
    ('00000000-0000-0000-0000-000000000002', 'women'),
    ('00000000-0000-0000-0000-000000000002', 'bipoc'),
    ('00000000-0000-0000-0000-000000000002', 'fifty_plus');