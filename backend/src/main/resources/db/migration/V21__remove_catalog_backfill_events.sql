-- Remove synthetic catalog backfill events.
-- Keep only API-sourced events in the dataset.

DELETE FROM astronomical_events
WHERE source = 'catalog_backfill';
