-- Remove all seed data — events and locations will come from real APIs
DELETE FROM visibility_forecasts;
DELETE FROM event_highlights;
DELETE FROM favorites;
DELETE FROM observation_logs;
DELETE FROM social_export_jobs;
DELETE FROM astronomical_events;
-- Remove seed locations (city search uses external APIs as fallback)
DELETE FROM locations WHERE id NOT IN (SELECT DISTINCT preferred_city_id FROM users WHERE preferred_city_id IS NOT NULL);
