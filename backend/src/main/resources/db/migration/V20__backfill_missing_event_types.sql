-- Backfill historical published events for event types that are missing in production data.
-- This ensures the feed can surface a diverse catalog even when external APIs only provide space weather types.

INSERT INTO astronomical_events (
    id,
    slug,
    title,
    type,
    description,
    start_at,
    end_at,
    relevance_score,
    status,
    source,
    external_id,
    created_at,
    updated_at
)
SELECT
    '11111111-1111-1111-1111-111111111111'::uuid,
    'eclipse-solar-2025-04-08-historico',
    'Eclipse Solar Total - Historico',
    'ECLIPSE_SOLAR',
    'Evento historico de eclipse solar total para compor o catalogo de referencia.',
    TIMESTAMPTZ '2025-04-08T17:00:00Z',
    TIMESTAMPTZ '2025-04-08T19:30:00Z',
    82,
    'PUBLISHED',
    'catalog_backfill',
    'catalog-backfill-eclipse-solar-2025-04-08',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM astronomical_events WHERE type = 'ECLIPSE_SOLAR'
);

INSERT INTO astronomical_events (
    id, slug, title, type, description, start_at, end_at, relevance_score, status, source, external_id, created_at, updated_at
)
SELECT
    '22222222-2222-2222-2222-222222222222'::uuid,
    'eclipse-lunar-2025-03-14-historico',
    'Eclipse Lunar Total - Historico',
    'ECLIPSE_LUNAR',
    'Evento historico de eclipse lunar total para ampliar diversidade do feed.',
    TIMESTAMPTZ '2025-03-14T02:30:00Z',
    TIMESTAMPTZ '2025-03-14T06:00:00Z',
    74,
    'PUBLISHED',
    'catalog_backfill',
    'catalog-backfill-eclipse-lunar-2025-03-14',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM astronomical_events WHERE type = 'ECLIPSE_LUNAR'
);

INSERT INTO astronomical_events (
    id, slug, title, type, description, start_at, end_at, relevance_score, status, source, external_id, created_at, updated_at
)
SELECT
    '33333333-3333-3333-3333-333333333333'::uuid,
    'chuva-meteoros-geminidas-2025-historico',
    'Chuva de Meteoros Geminidas - Historico',
    'METEOR_SHOWER',
    'Pico historico da Geminidas para referencia de observacao.',
    TIMESTAMPTZ '2025-12-14T01:00:00Z',
    TIMESTAMPTZ '2025-12-14T11:00:00Z',
    78,
    'PUBLISHED',
    'catalog_backfill',
    'catalog-backfill-meteor-shower-geminidas-2025',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM astronomical_events WHERE type = 'METEOR_SHOWER'
);

INSERT INTO astronomical_events (
    id, slug, title, type, description, start_at, end_at, relevance_score, status, source, external_id, created_at, updated_at
)
SELECT
    '44444444-4444-4444-4444-444444444444'::uuid,
    'conjuncao-venus-jupiter-2025-historico',
    'Conjuncao Venus e Jupiter - Historico',
    'CONJUNCTION',
    'Conjuncao planetaria historica para enriquecer o catalogo.',
    TIMESTAMPTZ '2025-08-12T19:00:00Z',
    TIMESTAMPTZ '2025-08-12T22:00:00Z',
    66,
    'PUBLISHED',
    'catalog_backfill',
    'catalog-backfill-conjunction-venus-jupiter-2025',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM astronomical_events WHERE type = 'CONJUNCTION'
);

INSERT INTO astronomical_events (
    id, slug, title, type, description, start_at, end_at, relevance_score, status, source, external_id, created_at, updated_at
)
SELECT
    '55555555-5555-5555-5555-555555555555'::uuid,
    'oposicao-marte-2025-historico',
    'Oposicao de Marte - Historico',
    'OPPOSITION',
    'Evento historico de oposicao para acompanhamento de referencias.',
    TIMESTAMPTZ '2025-01-16T00:00:00Z',
    TIMESTAMPTZ '2025-01-16T23:59:00Z',
    71,
    'PUBLISHED',
    'catalog_backfill',
    'catalog-backfill-opposition-mars-2025',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM astronomical_events WHERE type = 'OPPOSITION'
);

INSERT INTO astronomical_events (
    id, slug, title, type, description, start_at, end_at, relevance_score, status, source, external_id, created_at, updated_at
)
SELECT
    '66666666-6666-6666-6666-666666666666'::uuid,
    'transito-mercurio-2025-historico',
    'Transito de Mercurio - Historico',
    'TRANSIT',
    'Registro historico de transito para manter variedade no feed de eventos.',
    TIMESTAMPTZ '2025-11-07T10:00:00Z',
    TIMESTAMPTZ '2025-11-07T15:00:00Z',
    63,
    'PUBLISHED',
    'catalog_backfill',
    'catalog-backfill-transit-mercury-2025',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM astronomical_events WHERE type = 'TRANSIT'
);

INSERT INTO astronomical_events (
    id, slug, title, type, description, start_at, end_at, relevance_score, status, source, external_id, created_at, updated_at
)
SELECT
    '77777777-7777-7777-7777-777777777777'::uuid,
    'superlua-agosto-2025-historico',
    'Superlua de Agosto - Historico',
    'SUPERMOON',
    'Superlua historica para representar eventos lunares no catalogo.',
    TIMESTAMPTZ '2025-08-19T00:00:00Z',
    TIMESTAMPTZ '2025-08-19T23:59:00Z',
    69,
    'PUBLISHED',
    'catalog_backfill',
    'catalog-backfill-supermoon-2025-08',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM astronomical_events WHERE type = 'SUPERMOON'
);

INSERT INTO astronomical_events (
    id, slug, title, type, description, start_at, end_at, relevance_score, status, source, external_id, created_at, updated_at
)
SELECT
    '88888888-8888-8888-8888-888888888888'::uuid,
    'cometa-12p-pons-brooks-2025-historico',
    'Cometa 12P/Pons-Brooks - Historico',
    'COMET',
    'Passagem historica de cometa para composicao de acervo de eventos.',
    TIMESTAMPTZ '2025-04-20T00:00:00Z',
    TIMESTAMPTZ '2025-04-20T23:59:00Z',
    72,
    'PUBLISHED',
    'catalog_backfill',
    'catalog-backfill-comet-12p-2025',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM astronomical_events WHERE type = 'COMET'
);

INSERT INTO astronomical_events (
    id, slug, title, type, description, start_at, end_at, relevance_score, status, source, external_id, created_at, updated_at
)
SELECT
    '99999999-9999-9999-9999-999999999999'::uuid,
    'aurora-boreal-2025-historico',
    'Aurora Boreal Intensa - Historico',
    'AURORA',
    'Registro historico de aurora para complementar tipos de eventos visuais.',
    TIMESTAMPTZ '2025-05-11T21:00:00Z',
    TIMESTAMPTZ '2025-05-12T04:00:00Z',
    76,
    'PUBLISHED',
    'catalog_backfill',
    'catalog-backfill-aurora-2025-05-11',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM astronomical_events WHERE type = 'AURORA'
);

INSERT INTO astronomical_events (
    id, slug, title, type, description, start_at, end_at, relevance_score, status, source, external_id, created_at, updated_at
)
SELECT
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'ocultacao-lunar-jupiter-2025-historico',
    'Ocultacao Lunar de Jupiter - Historico',
    'OCCULTATION',
    'Ocultacao historica adicionada para cobrir tipo de evento faltante.',
    TIMESTAMPTZ '2025-09-03T03:00:00Z',
    TIMESTAMPTZ '2025-09-03T05:00:00Z',
    64,
    'PUBLISHED',
    'catalog_backfill',
    'catalog-backfill-occultation-jupiter-2025',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM astronomical_events WHERE type = 'OCCULTATION'
);

INSERT INTO astronomical_events (
    id, slug, title, type, description, start_at, end_at, relevance_score, status, source, external_id, created_at, updated_at
)
SELECT
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    'evento-astronomico-diverso-2025-historico',
    'Evento Astronomico Diverso - Historico',
    'OTHER',
    'Evento de referencia geral para categoria Other.',
    TIMESTAMPTZ '2025-06-01T00:00:00Z',
    TIMESTAMPTZ '2025-06-01T23:59:00Z',
    50,
    'PUBLISHED',
    'catalog_backfill',
    'catalog-backfill-other-2025-06-01',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM astronomical_events WHERE type = 'OTHER'
);
