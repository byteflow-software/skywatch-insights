INSERT INTO astronomical_events (id, slug, title, type, description, start_at, end_at, relevance_score, status, source, created_at, updated_at) VALUES
    (gen_random_uuid(), 'eclipse-lunar-total-2026-03', 'Eclipse Lunar Total', 'ECLIPSE_LUNAR',
     'Eclipse lunar total visível em grande parte do Brasil. A Lua entrará completamente na sombra da Terra, adquirindo uma tonalidade avermelhada característica conhecida como "Lua de Sangue". Excelente oportunidade para fotografia astronômica.',
     '2026-03-28 02:00:00+00', '2026-03-28 06:30:00+00', 95, 'PUBLISHED', 'manual', NOW(), NOW()),

    (gen_random_uuid(), 'chuva-meteoros-liridas-2026', 'Chuva de Meteoros Líridas', 'METEOR_SHOWER',
     'As Líridas são uma chuva de meteoros anual que ocorre quando a Terra passa pelos detritos do cometa C/1861 G1 Thatcher. Espere até 20 meteoros por hora no pico, com traços brilhantes e ocasionais bólidos.',
     '2026-04-16 00:00:00+00', '2026-04-25 23:59:00+00', 70, 'PUBLISHED', 'manual', NOW(), NOW()),

    (gen_random_uuid(), 'conjuncao-venus-jupiter-2026', 'Conjunção Venus-Júpiter', 'CONJUNCTION',
     'Venus e Júpiter estarão extremamente próximos no céu noturno, separados por menos de 1 grau. Um espetáculo visível a olho nu, especialmente impressionante no horizonte oeste logo após o pôr do sol.',
     '2026-05-01 22:00:00+00', '2026-05-02 02:00:00+00', 88, 'PUBLISHED', 'manual', NOW(), NOW()),

    (gen_random_uuid(), 'superlua-maio-2026', 'Superlua de Maio', 'SUPERMOON',
     'A Lua Cheia de maio coincide com o perigeu lunar, resultando em uma Superlua que aparece até 14% maior e 30% mais brilhante que uma Lua Cheia típica. Ideal para observação e fotografia.',
     '2026-05-14 18:00:00+00', '2026-05-15 06:00:00+00', 75, 'PUBLISHED', 'manual', NOW(), NOW()),

    (gen_random_uuid(), 'chuva-meteoros-eta-aquaridas-2026', 'Chuva de Meteoros Eta Aquáridas', 'METEOR_SHOWER',
     'Originada dos detritos do cometa Halley, as Eta Aquáridas produzem até 50 meteoros por hora no hemisfério sul. Meteoros rápidos e brilhantes, melhor visibilidade nas horas antes do amanhecer.',
     '2026-04-19 00:00:00+00', '2026-05-28 23:59:00+00', 82, 'PUBLISHED', 'manual', NOW(), NOW()),

    (gen_random_uuid(), 'eclipse-solar-anular-2026-08', 'Eclipse Solar Anular', 'ECLIPSE_SOLAR',
     'Eclipse solar anular visível parcialmente no norte do Brasil. O chamado "anel de fogo" será visível na faixa de anularidade. NUNCA observe o Sol diretamente sem proteção adequada.',
     '2026-08-12 12:00:00+00', '2026-08-12 18:00:00+00', 92, 'PUBLISHED', 'manual', NOW(), NOW()),

    (gen_random_uuid(), 'oposicao-saturno-2026', 'Oposição de Saturno', 'OPPOSITION',
     'Saturno estará em oposição ao Sol, significando que estará no ponto mais próximo da Terra e totalmente iluminado. Melhor época do ano para observar os anéis de Saturno com telescópio.',
     '2026-09-21 00:00:00+00', '2026-09-22 23:59:00+00', 80, 'PUBLISHED', 'manual', NOW(), NOW()),

    (gen_random_uuid(), 'chuva-meteoros-perseidas-2026', 'Chuva de Meteoros Perseidas', 'METEOR_SHOWER',
     'Uma das chuvas de meteoros mais populares do ano, com até 100 meteoros por hora no pico. Melhor visibilidade no hemisfério norte, mas também visível nas latitudes mais ao norte do Brasil.',
     '2026-07-17 00:00:00+00', '2026-08-24 23:59:00+00', 85, 'PUBLISHED', 'manual', NOW(), NOW());
