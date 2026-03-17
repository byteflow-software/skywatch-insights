# SkyWatch Insights

Plataforma de acompanhamento de eventos astronômicos com previsão de observabilidade, favoritos, observações pessoais e exportação para redes sociais.

## Tecnologias

**Backend:** Java 21, Spring Boot 3.3, Spring Security, Spring Data JPA, Flyway, Redis 7, PostgreSQL 16

**Frontend:** React 18, TypeScript 5, Vite 5, Tailwind CSS, TanStack Query, React Router 6, Zod

**Infraestrutura:** Docker Compose, Nginx, Vercel Blob Storage

## Funcionalidades

- Catálogo de eventos astronômicos com dados de APIs reais (NASA, USNO, NOAA SWPC, Stellarium)
- Previsão de observabilidade com dados climáticos (OpenWeatherMap)
- Status inteligente dos eventos (próximo, em andamento, melhor janela, encerrado)
- Sistema de favoritos com toggle e listagem paginada
- Registro de observações pessoais com notas e condições
- Comentários polimórficos em eventos e observações
- Upload de avatar via Vercel Blob Storage
- Exportação para redes sociais (beta)
- Dashboard com estatísticas e destaques
- Autenticação JWT com registro e login

## Pré-requisitos

- Docker e Docker Compose
- Java 21 (desenvolvimento local do backend)
- Node.js 20 (desenvolvimento local do frontend)

## Início rápido

```bash
# Subir todos os serviços
cd infra
docker compose up --build -d
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

## Variáveis de ambiente

Crie um arquivo `.env` em `infra/` para configurar:

| Variável | Descrição | Padrão |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | Token do Vercel Blob Storage | — |
| `NASA_API_KEY` | Chave da API da NASA | `DEMO_KEY` |
| `ASTRONOMY_API_APP_ID` | App ID do AstronomyAPI | — |
| `ASTRONOMY_API_APP_SECRET` | App Secret do AstronomyAPI | — |
| `VITE_ENABLE_EXPORT` | Habilitar exportação para redes sociais | `false` |

## Desenvolvimento local

```bash
# Backend
cd backend
./gradlew bootRun

# Frontend
cd frontend
npm install
npm run dev
```

## Testes

```bash
# Frontend
cd frontend
npm test
npm run lint
```

## Estrutura do projeto

```
backend/          # API Spring Boot
frontend/         # SPA React
infra/            # Docker Compose e configuração
specs/            # Especificações e planos das features
docs/             # Documentos de referência
```

## APIs externas integradas

- **NASA APOD & NEO** — imagens e objetos próximos da Terra
- **USNO** — dados de eclipses
- **NOAA SWPC** — índice Kp para auroras
- **Stellarium** — catálogo de chuvas de meteoros
- **OpenWeatherMap** — previsão climática para observabilidade
- **Vercel Blob** — armazenamento de imagens (avatares, exportações)
