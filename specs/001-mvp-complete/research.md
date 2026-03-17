# Research: SkyWatch Insights — MVP Completo

**Date**: 2026-03-09
**Branch**: `001-mvp-complete`

## R1: Backend Framework — Spring Boot 3.x com Java 21

**Decision**: Spring Boot 3.3+ com Java 21 (LTS).
**Rationale**: Stack definida na constituição. Java 21 oferece virtual threads, pattern matching e records que simplificam DTOs. Spring Boot 3.x requer Java 17+ e traz suporte nativo a GraalVM, observabilidade melhorada e Security atualizado com OAuth2 Resource Server.
**Alternatives considered**: Quarkus (menor footprint mas ecossistema menor); Micronaut (compilação AOT mas menos documentação para portfólio).

## R2: Frontend Framework — React 18 + Vite + Tailwind + shadcn/ui

**Decision**: React 18 com TypeScript, Vite 5, Tailwind CSS 3, shadcn/ui.
**Rationale**: Stack definida na constituição. shadcn/ui fornece componentes acessíveis (Radix UI) com customização total via Tailwind — ideal para design tokens customizados. TanStack Query para cache e sincronização de dados do servidor. Zod para validação de schemas no frontend alinhada com Bean Validation no backend.
**Alternatives considered**: Next.js (SSR desnecessário para SPA de portfólio); Vue + Nuxt (menor mercado para portfólio Java/React).

## R3: Banco de Dados — PostgreSQL 16 + Flyway

**Decision**: PostgreSQL 16 como banco principal. Flyway para migrations versionadas.
**Rationale**: PostgreSQL é robusto, suporta JSONB para dados semi-estruturados (templates de exportação), full-text search para eventos e tem excelente suporte com Spring Data JPA. Flyway garante migrations versionadas desde o início (Princípio II).
**Alternatives considered**: MySQL (menos features avançadas); MongoDB (schema-less desnecessário para domínio bem definido).

## R4: Cache — Redis 7

**Decision**: Redis 7 como cache opcional para previsões de visibilidade e consultas frequentes.
**Rationale**: Previsões de observabilidade dependem de dados climáticos que mudam lentamente (horas). Cache em Redis evita recalcular score a cada request. Spring Cache abstrai a implementação com `@Cacheable`.
**Alternatives considered**: Caffeine (in-memory, sem distribuição); sem cache (recalcular sempre — impacto em < 500ms target).

## R5: Geração de Imagens para Exportação Social

**Decision**: Geração server-side com biblioteca Java de manipulação de imagens (Java2D / imgscalr para redimensionamento) + templates HTML renderizados via headless browser (Playwright for Java) ou geração direta com Graphics2D.
**Rationale**: As artes de exportação precisam de layout preciso (safe zones, design tokens, tipografia). Para o MVP, templates baseados em Graphics2D com posicionamento preciso são suficientes. Se necessário, migrar para renderização HTML com Playwright.
**Alternatives considered**: Canvas API no frontend (não gera server-side, dificulta batch); Sharp/Node.js (adiciona runtime extra); Puppeteer (Node.js dependency).

## R6: Armazenamento de Assets — S3-Compatible

**Decision**: MinIO local para desenvolvimento, S3-compatible para produção (AWS S3, Cloudflare R2 ou similar).
**Rationale**: Assets exportados (imagens, bundles de texto) precisam de armazenamento persistente e servível via URL. MinIO é compatível com S3 API e roda no docker-compose local. Spring fornece integração via AWS SDK.
**Alternatives considered**: Filesystem local (não escala, URLs não públicas); Cloudinary (vendor lock-in para portfólio).

## R7: Autenticação — JWT com Spring Security

**Decision**: JWT stateless com access token (15min) + refresh token (7 dias). Bcrypt para hash de senhas.
**Rationale**: Definido na constituição. JWT stateless simplifica deploy e escala. Refresh token permite renovação sem re-login. Spring Security 6.x suporta JWT nativamente via `oauth2-resource-server`.
**Alternatives considered**: Session-based (requer sticky sessions); OAuth2 com provedor externo (complexidade excessiva para MVP).

## R8: Dados Astronômicos — Fonte e Ingestão

**Decision**: Curadoria manual/editorial para MVP com modelo preparado para integração gradual com APIs externas.
**Rationale**: O documento de requisitos define que "a lógica de eventos pode começar com curadoria parcial e integração gradual com fontes externas". Para o MVP, eventos serão inseridos via interface admin. O modelo AstronomicalEvent inclui campo `source` para rastrear origem.
**Alternatives considered**: NASA API (confiável mas limitada a alguns tipos de evento); In-The-Sky.org (scraping não confiável); API direta desde o início (risco de dependência externa no MVP).

## R9: Dados Climáticos para Score de Observabilidade

**Decision**: OpenWeatherMap API (plano gratuito: 1000 calls/dia) com cache em Redis (TTL 3h) e fallback para último dado disponível.
**Rationale**: O score de observabilidade depende de cobertura de nuvens, umidade e visibilidade. OpenWeatherMap fornece esses dados via endpoint `forecast`. Cache de 3h é razoável pois previsão meteorológica muda lentamente. Fallback garante NFR de disponibilidade (SC-010).
**Alternatives considered**: Open-Meteo (gratuito, sem chave, mas menos dados de visibilidade); WeatherAPI (melhor dados astronômicos mas plano gratuito limitado).

## R10: Testes — Estratégia

**Decision**: JUnit 5 + Mockito para testes unitários, Testcontainers para testes de integração (PostgreSQL + Redis reais), Vitest + React Testing Library para frontend.
**Rationale**: Princípio V exige testes em regras de negócio, autenticação e exportação social. Testcontainers garante testes de integração realistas sem mocks de banco. Vitest é nativo do Vite para velocidade.
**Alternatives considered**: H2 in-memory (comportamento diferente do PostgreSQL); Cypress (e2e mais lento, pode ser adicionado depois).

## R11: Deploy — Docker + Cloud

**Decision**: Docker Compose para desenvolvimento local. Deploy em cloud provider com containers (Railway, Render, ou AWS ECS).
**Rationale**: Docker Compose unifica PostgreSQL, Redis, backend e frontend em um único `docker-compose up`. Para deploy público (AC-07), Railway ou Render oferecem planos gratuitos/baratos adequados para portfólio.
**Alternatives considered**: Kubernetes (overkill para MVP); Heroku (ainda viável mas pricing mudou); VPS manual (mais trabalho operacional).

## R12: Geração de Texto para Exportação Social

**Decision**: Templates parametrizados com placeholders armazenados no banco (SocialExportTemplate). Engine de substituição simples em Java com formatação por rede. Variantes de objetivo (engajamento/educação/autoridade) controladas por templates diferentes.
**Rationale**: Para o MVP, templates com variáveis `{eventTitle}`, `{bestTime}`, `{observabilityScore}` etc. são suficientes. Parametrização permite ajuste sem redeploy (FR-034). Cada rede+formato+objetivo = 1 template.
**Alternatives considered**: LLM para geração dinâmica (custo e latência excessivos para MVP); Markdown templates (menos controle de formatação por rede).

---

## Home Page Pública — Research Addendum (2026-03-10)

### R13: Scroll infinito com TanStack Query

**Decision**: `useInfiniteQuery` do TanStack Query com `IntersectionObserver` nativo.
**Rationale**: TanStack Query já é dependência do projeto e `useInfiniteQuery` tem suporte nativo para paginação offset. IntersectionObserver é a abordagem moderna sem dependências extras.
**Alternatives considered**: Pagination clássica (não combina com UX de rede social); react-infinite-scroll-component (dependência extra desnecessária).

### R14: Layout público separado

**Decision**: `PublicLayout` separado (header minimalista + footer, sem sidebar).
**Rationale**: A home pública tem propósito diferente (atrair visitantes). Header mostra logo, login e CTA de cadastro. Separar evita condicional no MainLayout.
**Alternatives considered**: Reutilizar MainLayout com sidebar condicional (acoplamento desnecessário); sem layout wrapper (inconsistência visual).

### R15: Cidade padrão para condições astronômicas

**Decision**: Endpoint público `GET /api/v1/astro-conditions/location/{locationId}` com locationId de São Paulo.
**Rationale**: Endpoint já existe e é público. Buscar locationId via `/cities/search?q=São Paulo` e cachear com TanStack Query (staleTime longo).
**Alternatives considered**: Novo endpoint backend `/astro-conditions/default` (complexidade desnecessária); Open-Meteo direto do frontend (viola arquitetura de proxy).

### R16: Detecção de autenticação para CTAs

**Decision**: Verificar `localStorage.getItem('access_token')` nos componentes da home.
**Rationale**: Padrão já existente no `ProtectedRoute`. Simples e consistente. AuthProvider pode não estar montado em rotas públicas.
**Alternatives considered**: Context-only (pode não estar disponível fora do ProtectedRoute wrapper).

---

## Reestruturação de Navegação — Research Addendum (2026-03-12)

### R17: Bottom Navigation para usuários autenticados

**Decision**: Bottom nav fixo com 5 ícones (Home, Eventos, Favoritos, Observações, Perfil), visível apenas quando `getAccessToken()` retorna token.
**Rationale**: Padrão mobile-first amplamente adotado (Instagram, Spotify, apps nativos). 5 ícones é o máximo recomendado pelo Material Design para bottom nav. Visibilidade condicional baseada em token evita mostrar nav para visitantes públicos.
**Alternatives considered**: Sidebar colapsável (não adequado para mobile-first); hamburger menu (esconde navegação, pior UX); top tabs (conflita com glassmorphism nav existente).

### R18: AuthLayout — wrapper dark theme para telas autenticadas

**Decision**: Novo componente `AuthLayout` que aplica `bg-[#050A18]`, inclui bottom nav, e adiciona padding inferior (`pb-20`) para não sobrepor conteúdo.
**Rationale**: Separar de PublicLayout evita condicionais complexos. AuthLayout envolve telas que já existem (EventListPage, FavoritesListPage, etc.) apenas adicionando o wrapper dark + bottom nav. PublicLayout mantém a experiência pública da home.
**Alternatives considered**: Modificar PublicLayout com condicionais (acoplamento); usar MainLayout existente (tem sidebar que queremos eliminar); CSS-only dark mode toggle (não cobre layout estrutural).

### R19: Migração de dark theme em telas existentes

**Decision**: Migrar telas existentes (EventListPage, EventDetailPage, FavoritesListPage, ObservationTimeline, ObservationForm, SettingsPage) para dark theme usando os mesmos design tokens da home: `bg-[#050A18]`, cards `bg-white/[0.03] border-white/5`, texto `text-white`/`text-gray-400`, inputs `bg-white/5 border-white/10`.
**Rationale**: Consistência visual é essencial. As telas já têm lógica funcional completa — a migração é puramente visual (classes Tailwind). Usar os mesmos tokens da home garante coesão sem criar novo sistema de design.
**Alternatives considered**: Tailwind dark mode plugin com `dark:` prefix (requer toggle, não queremos toggle — é always-dark para auth); CSS variables com tema (overhead desnecessário quando Tailwind já resolve).
