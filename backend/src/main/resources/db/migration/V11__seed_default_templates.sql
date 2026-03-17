-- =============================================================================
-- V11: Seed default social export templates
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- INSTAGRAM_STORY  (story-9x16)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO social_export_templates (id, network, format, objective, layout_version, text_template, character_limit, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'INSTAGRAM_STORY', 'story-9x16', 'ENGAGEMENT', '1.0',
 E'🔭 Don''t miss this!\n\n{eventTitle}\n\n{eventDescription}\n\n⏰ Best window: {bestWindow}\n\nSave this & share with a friend who loves the sky!',
 200, true, NOW(), NOW()),

(gen_random_uuid(), 'INSTAGRAM_STORY', 'story-9x16', 'EDUCATION', '1.0',
 E'🌌 Did you know?\n\n{eventTitle} is a {eventType} event.\n\n{eventDescription}\n\n📅 When to look: {bestWindow}\n\nSwipe up to learn more!',
 200, true, NOW(), NOW()),

(gen_random_uuid(), 'INSTAGRAM_STORY', 'story-9x16', 'AUTHORITY', '1.0',
 E'📡 SkyWatch Insights\n\n{eventTitle}\n\nObservability Score: {observabilityScore}/100\n\n{eventDescription}\n\nBest window: {bestWindow}',
 200, true, NOW(), NOW());

-- ─────────────────────────────────────────────────────────────────────────────
-- INSTAGRAM_REELS  (reels-cover)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO social_export_templates (id, network, format, objective, layout_version, text_template, character_limit, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'INSTAGRAM_REELS', 'reels-cover', 'ENGAGEMENT', '1.0',
 E'{eventTitle} is coming! 🌠\n\n{eventDescription}\n\nWho are you watching with? Tag them below! 👇\n\n⏰ {bestWindow}\n\n#astronomy #skywatch #stargazing',
 2200, true, NOW(), NOW()),

(gen_random_uuid(), 'INSTAGRAM_REELS', 'reels-cover', 'EDUCATION', '1.0',
 E'Everything you need to know about {eventTitle} ⬇️\n\nType: {eventType}\n\n{eventDescription}\n\n🗓️ Best viewing window: {bestWindow}\n\nFollow for more sky events!',
 2200, true, NOW(), NOW()),

(gen_random_uuid(), 'INSTAGRAM_REELS', 'reels-cover', 'AUTHORITY', '1.0',
 E'{eventTitle} — Full Analysis\n\nObservability: {observabilityScore}/100\nType: {eventType}\n\n{eventDescription}\n\nOptimal window: {bestWindow}\n\nData by SkyWatch Insights',
 2200, true, NOW(), NOW());

-- ─────────────────────────────────────────────────────────────────────────────
-- INSTAGRAM_FEED  (feed-portrait)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO social_export_templates (id, network, format, objective, layout_version, text_template, character_limit, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'INSTAGRAM_FEED', 'feed-portrait', 'ENGAGEMENT', '1.0',
 E'✨ {eventTitle}\n\n{eventDescription}\n\n📍 Best time to observe: {bestWindow}\n\nDouble-tap if you''re excited! ❤️ Share with someone who needs to see this.\n\n#astronomy #nightsky #stargazing #skywatch',
 2200, true, NOW(), NOW()),

(gen_random_uuid(), 'INSTAGRAM_FEED', 'feed-portrait', 'EDUCATION', '1.0',
 E'🔬 {eventTitle}\n\nEvent type: {eventType}\n\n{eventDescription}\n\n🕐 Viewing window: {bestWindow}\nObservability score: {observabilityScore}/100\n\nSave this post for later! 🔖\n\n#astronomy #science #education #skywatch',
 2200, true, NOW(), NOW()),

(gen_random_uuid(), 'INSTAGRAM_FEED', 'feed-portrait', 'AUTHORITY', '1.0',
 E'🛰️ {eventTitle} — Expert Briefing\n\nCategory: {eventType}\nObservability: {observabilityScore}/100\nWindow: {bestWindow}\n\n{eventDescription}\n\nSource: {source}\n\n#astronomy #astrophysics #skywatch #data',
 2200, true, NOW(), NOW());

-- ─────────────────────────────────────────────────────────────────────────────
-- THREADS  (thread-short)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO social_export_templates (id, network, format, objective, layout_version, text_template, character_limit, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'THREADS', 'thread-short', 'ENGAGEMENT', '1.0',
 E'{eventTitle} is almost here! 🌠\n\n{eventDescription}\n\nWho''s staying up to watch? 👀',
 500, true, NOW(), NOW()),

(gen_random_uuid(), 'THREADS', 'thread-short', 'EDUCATION', '1.0',
 E'🔭 {eventTitle}\n\nType: {eventType}\n{eventDescription}\n\nBest window: {bestWindow}',
 500, true, NOW(), NOW()),

(gen_random_uuid(), 'THREADS', 'thread-short', 'AUTHORITY', '1.0',
 E'{eventTitle}\nScore: {observabilityScore}/100\n\n{eventDescription}\n\nWindow: {bestWindow}\n— SkyWatch Insights',
 500, true, NOW(), NOW());

-- ─────────────────────────────────────────────────────────────────────────────
-- THREADS  (thread-expanded)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO social_export_templates (id, network, format, objective, layout_version, text_template, character_limit, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'THREADS', 'thread-expanded', 'ENGAGEMENT', '1.0',
 E'🌌 Upcoming: {eventTitle}\n\n{eventDescription}\n\n⏰ Best viewing: {bestWindow}\n\nRepost this so your followers don''t miss it! 🔄',
 500, true, NOW(), NOW()),

(gen_random_uuid(), 'THREADS', 'thread-expanded', 'EDUCATION', '1.0',
 E'🧵 Let''s talk about {eventTitle}\n\nThis is a {eventType} event.\n\n{eventDescription}\n\n📅 Optimal viewing window: {bestWindow}\nObservability: {observabilityScore}/100\n\nFollow for daily sky updates.',
 500, true, NOW(), NOW()),

(gen_random_uuid(), 'THREADS', 'thread-expanded', 'AUTHORITY', '1.0',
 E'📊 {eventTitle} — Data Brief\n\nType: {eventType}\nObservability Score: {observabilityScore}/100\nViewing Window: {bestWindow}\n\n{eventDescription}\n\nPowered by SkyWatch Insights.',
 500, true, NOW(), NOW());

-- ─────────────────────────────────────────────────────────────────────────────
-- X  (tweet-short)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO social_export_templates (id, network, format, objective, layout_version, text_template, character_limit, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'X', 'tweet-short', 'ENGAGEMENT', '1.0',
 E'🔭 {eventTitle} is coming!\n\n{eventDescription}\n\nBest time to watch: {bestWindow}\n\nRT if you''re excited! 🌠',
 280, true, NOW(), NOW()),

(gen_random_uuid(), 'X', 'tweet-short', 'EDUCATION', '1.0',
 E'{eventTitle} ({eventType})\n\n{eventDescription}\n\n🕐 {bestWindow}\n\n#Astronomy',
 280, true, NOW(), NOW()),

(gen_random_uuid(), 'X', 'tweet-short', 'AUTHORITY', '1.0',
 E'{eventTitle}\nObservability: {observabilityScore}/100\nWindow: {bestWindow}\n\n{eventDescription}',
 280, true, NOW(), NOW());

-- ─────────────────────────────────────────────────────────────────────────────
-- X  (tweet-thread)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO social_export_templates (id, network, format, objective, layout_version, text_template, character_limit, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'X', 'tweet-thread', 'ENGAGEMENT', '1.0',
 E'🧵 Everything you need to know about {eventTitle} — a thread!\n\n1/ {eventDescription}\n\n2/ Best window: {bestWindow}\n\n3/ Don''t miss it — set your alarm! ⏰\n\nLike & RT to spread the word!',
 280, true, NOW(), NOW()),

(gen_random_uuid(), 'X', 'tweet-thread', 'EDUCATION', '1.0',
 E'🧵 {eventTitle} — explained\n\n1/ Type: {eventType}\n\n2/ {eventDescription}\n\n3/ Best viewing window: {bestWindow}\nObservability score: {observabilityScore}/100\n\nFollow for more space science!',
 280, true, NOW(), NOW()),

(gen_random_uuid(), 'X', 'tweet-thread', 'AUTHORITY', '1.0',
 E'{eventTitle} — Deep Dive 🧵\n\n1/ Event type: {eventType}\nObservability: {observabilityScore}/100\n\n2/ {eventDescription}\n\n3/ Optimal window: {bestWindow}\n\nSource: {source}\nvia @SkyWatchInsights',
 280, true, NOW(), NOW());

-- ─────────────────────────────────────────────────────────────────────────────
-- LINKEDIN  (linkedin-short)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO social_export_templates (id, network, format, objective, layout_version, text_template, character_limit, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'LINKEDIN', 'linkedin-short', 'ENGAGEMENT', '1.0',
 E'{eventTitle} — don''t miss this celestial event!\n\n{eventDescription}\n\nBest observation window: {bestWindow}\n\nWho else is watching? Let me know in the comments! 👇\n\n#Astronomy #Space #SkyWatch',
 700, true, NOW(), NOW()),

(gen_random_uuid(), 'LINKEDIN', 'linkedin-short', 'EDUCATION', '1.0',
 E'🔭 {eventTitle}\n\nEvent type: {eventType}\n\n{eventDescription}\n\nViewing window: {bestWindow}\nObservability: {observabilityScore}/100\n\n#Astronomy #Science #Education',
 700, true, NOW(), NOW()),

(gen_random_uuid(), 'LINKEDIN', 'linkedin-short', 'AUTHORITY', '1.0',
 E'{eventTitle} — Quick Analysis\n\nType: {eventType}\nObservability Score: {observabilityScore}/100\nOptimal Window: {bestWindow}\n\n{eventDescription}\n\n#Astronomy #DataDriven #SkyWatch',
 700, true, NOW(), NOW());

-- ─────────────────────────────────────────────────────────────────────────────
-- LINKEDIN  (linkedin-deep-dive)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO social_export_templates (id, network, format, objective, layout_version, text_template, character_limit, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'LINKEDIN', 'linkedin-deep-dive', 'ENGAGEMENT', '1.0',
 E'🌌 Upcoming Astronomical Event: {eventTitle}\n\nI''m excited to share that an extraordinary celestial event is on the horizon.\n\n{eventDescription}\n\n📅 Best observation window: {bestWindow}\n\nHave you ever witnessed a {eventType} event? I''d love to hear your stories in the comments.\n\n#Astronomy #Space #NightSky #SkyWatch',
 3000, true, NOW(), NOW()),

(gen_random_uuid(), 'LINKEDIN', 'linkedin-deep-dive', 'EDUCATION', '1.0',
 E'🔬 Deep Dive: {eventTitle}\n\nEvent Classification: {eventType}\nObservability Score: {observabilityScore}/100\nOptimal Viewing Window: {bestWindow}\n\n{eventDescription}\n\nKey Takeaways:\n• This is a {eventType} event with strong observability\n• Plan your viewing around the optimal window listed above\n• Clear skies and minimal light pollution will enhance visibility\n\nFollow for regular astronomical insights.\n\n#Astronomy #Science #Education #STEM',
 3000, true, NOW(), NOW()),

(gen_random_uuid(), 'LINKEDIN', 'linkedin-deep-dive', 'AUTHORITY', '1.0',
 E'📊 Astronomical Event Analysis: {eventTitle}\n\nEvent Type: {eventType}\nObservability Score: {observabilityScore}/100\nViewing Window: {bestWindow}\nSource: {source}\n\n{eventDescription}\n\nThis analysis was generated using SkyWatch Insights, which aggregates data from multiple astronomical sources to provide actionable observability scores.\n\n#Astronomy #Analytics #DataScience #SkyWatch',
 3000, true, NOW(), NOW());

-- ─────────────────────────────────────────────────────────────────────────────
-- LINKEDIN  (linkedin-carousel)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO social_export_templates (id, network, format, objective, layout_version, text_template, character_limit, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'LINKEDIN', 'linkedin-carousel', 'ENGAGEMENT', '1.0',
 E'🌠 {eventTitle} — Swipe through for everything you need to know!\n\n{eventDescription}\n\n⏰ Best window: {bestWindow}\n\nSave this post and share it with your network! ♻️\n\n#Astronomy #Space #SkyWatch',
 3000, true, NOW(), NOW()),

(gen_random_uuid(), 'LINKEDIN', 'linkedin-carousel', 'EDUCATION', '1.0',
 E'📚 {eventTitle} — A Visual Guide\n\nSlide 1: What is it? — {eventType}\nSlide 2: Details — {eventDescription}\nSlide 3: When — {bestWindow}\nSlide 4: Observability — {observabilityScore}/100\n\nSave & follow for more celestial guides.\n\n#Astronomy #Education #Science #STEM',
 3000, true, NOW(), NOW()),

(gen_random_uuid(), 'LINKEDIN', 'linkedin-carousel', 'AUTHORITY', '1.0',
 E'📡 {eventTitle} — Data Carousel\n\nEvent: {eventTitle}\nType: {eventType}\nScore: {observabilityScore}/100\nWindow: {bestWindow}\n\n{eventDescription}\n\nAll data sourced from SkyWatch Insights.\n\n#Astronomy #DataDriven #Analytics #SkyWatch',
 3000, true, NOW(), NOW());
