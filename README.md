<p align="center">
  <h1 align="center">SkyWatch Insights</h1>
  <p align="center">
    Plataforma fullstack de acompanhamento de eventos astronômicos com dados reais da NASA, NOAA e USNO.
    <br />
    Previsão de observabilidade, favoritos, observações pessoais e exportação para redes sociais.
  </p>
</p>

---

## Sobre o projeto

O SkyWatch Insights é uma aplicação fullstack que consome **6 APIs externas reais** para catalogar eventos astronômicos — eclipses, chuvas de meteoros, auroras, passagens de cometas — e entrega ao usuário uma experiência completa de acompanhamento, com previsão de observabilidade baseada em clima, status inteligente em tempo real e ferramentas sociais.

### Números do projeto

| Métrica | Valor |
|---|---|
| Linhas de código | ~15.800 |
| Classes Java (backend) | 132 |
| Componentes TypeScript (frontend) | 76 |
| Migrations SQL (Flyway) | 23 |
| Módulos backend | 15 |
| Módulos frontend | 8 |
| APIs externas integradas | 6 |

---

## Stack

### Backend
| Tecnologia | Uso |
|---|---|
| **Java 21** | Linguagem principal |
| **Spring Boot 3.3** | Framework REST API |
| **Spring Security** | Autenticação JWT |
| **Spring Data JPA + Hibernate** | ORM e acesso a dados |
| **Flyway** | Versionamento de schema (23 migrations) |
| **PostgreSQL 16** | Banco de dados principal |
| **Redis 7** | Cache de dados lunares (TTL 30min) |
| **MapStruct** | Mapeamento DTO/Entity |
| **Spring Scheduler** | Sincronização automática de APIs |

### Frontend
| Tecnologia | Uso |
|---|---|
| **React 18** | UI library |
| **TypeScript 5** | Tipagem estática |
| **Vite 5** | Build tool |
| **Tailwind CSS** | Design system dark customizado |
| **TanStack Query** | Cache e sincronização de estado servidor |
| **React Router 6** | Roteamento SPA |
| **React Hook Form + Zod** | Formulários com validação |
| **Lucide React** | Iconografia |

### Infraestrutura
| Tecnologia | Uso |
|---|---|
| **Docker Compose** | Orquestração de serviços |
| **Nginx** | Reverse proxy e serving |
| **Vercel Blob Storage** | Upload de avatares e imagens de exportação |

---

## Funcionalidades

### Catálogo de eventos astronômicos
Sincronização automática com NASA, USNO, NOAA SWPC e Stellarium. Eclipses solares/lunares, chuvas de meteoros, auroras boreais, trânsitos planetários e passagens de objetos próximos da Terra (NEOs).

### Status inteligente
Cada evento exibe um status calculado em tempo real no frontend: **próximo**, **em andamento**, **melhor janela de observação** ou **encerrado** — baseado nas janelas temporais de início, pico e fim.

### Previsão de observabilidade
Integração com OpenWeatherMap para calcular a viabilidade de observação baseada em cobertura de nuvens, fase lunar e condições climáticas locais.

### Favoritos e observações
Sistema de favoritos com toggle e listagem paginada. Registro de observações pessoais com notas, condições do céu e equipamento utilizado.

### Comentários polimórficos
Arquitetura de comentários com `targetType` + `targetId` que atende tanto eventos quanto observações sem duplicação de tabelas ou lógica.

### Upload de avatar
Upload via Vercel Blob Storage com validação de tipo (JPEG, PNG, WebP, GIF) e tamanho (5MB), com preview em tempo real.

### Exportação para redes sociais (Beta)
Geração de cards visuais otimizados para Instagram, Twitter/X e Facebook com informações do evento.

### Autenticação
Registro e login com JWT, proteção de rotas e gerenciamento de perfil.

---

## Decisões técnicas

| Decisão | Motivação |
|---|---|
| **Comentários polimórficos** (`targetType` + `targetId`) | Evitar tabelas e controllers duplicados para comentários em eventos vs observações |
| **Status inteligente no frontend** | Evitar carga desnecessária no backend — o cálculo depende apenas de timestamps já disponíveis |
| **Cache Redis para dados lunares** | Dados da fase lunar mudam lentamente; cache de 30min reduz chamadas externas |
| **Normalização de respostas paginadas** | Backend retorna `data`, frontend espera `content` — camada de normalização nos hooks evita acoplamento |
| **`JOIN FETCH` com `countQuery`** | Resolver `LazyInitializationException` em listagens paginadas sem perder a paginação do Spring Data |
| **Feature flag via env var** | Exportação em beta controlada por `VITE_ENABLE_EXPORT` com fallback visual no frontend |

---

## APIs externas integradas

| API | Dados |
|---|---|
| **NASA APOD** | Imagem astronômica do dia |
| **NASA NEO (NeoWs)** | Objetos próximos da Terra |
| **NASA DONKI** | Tempestades geomagnéticas e CMEs |
| **USNO** | Eclipses solares e lunares |
| **NOAA SWPC** | Índice Kp para previsão de auroras |
| **Stellarium** | Catálogo de chuvas de meteoros |
| **OpenWeatherMap** | Previsão climática para observabilidade |
| **AstronomyAPI** | Posições planetárias e eventos |
| **JPL SBDB** | Dados de cometas e asteroides |

---

## Arquitetura

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend API    │────▶│ PostgreSQL   │
│  React/Vite  │     │  Spring Boot 3.3 │     │     16       │
│  Port 3000   │     │    Port 8080     │     │  Port 5432   │
└─────────────┘     └──────┬───────────┘     └──────────────┘
                           │
                    ┌──────┴───────┐
                    │              │
               ┌────▼────┐  ┌─────▼──────┐
               │  Redis  │  │  APIs Ext.  │
               │  Cache  │  │ NASA, NOAA  │
               │  6379   │  │ USNO, etc.  │
               └─────────┘  └────────────┘
```

---

## Estrutura do projeto

```
backend/                          # API Spring Boot
├── src/main/java/com/skywatch/
│   ├── auth/                     # Autenticação JWT
│   ├── event/                    # Eventos astronômicos
│   ├── astrosync/                # Sincronização com APIs externas
│   ├── forecast/                 # Previsão de observabilidade
│   ├── favorite/                 # Sistema de favoritos
│   ├── observation/              # Observações pessoais
│   ├── comment/                  # Comentários polimórficos
│   ├── export/                   # Exportação para redes sociais
│   ├── user/                     # Perfil e avatar
│   ├── highlight/                # Destaques editoriais
│   ├── analytics/                # Tracking de uso
│   ├── admin/                    # Painel administrativo
│   ├── location/                 # Localização do usuário
│   ├── config/                   # Configurações (CORS, Security, Redis)
│   └── shared/                   # DTOs e utilitários compartilhados
├── src/main/resources/
│   └── db/migration/             # 23 migrations Flyway
└── build.gradle

frontend/                         # SPA React
├── src/
│   ├── features/                 # Módulos por domínio
│   │   ├── home/                 # Feed principal
│   │   ├── events/               # Listagem e detalhe de eventos
│   │   ├── favorites/            # Página de favoritos
│   │   ├── observations/         # Observações pessoais
│   │   ├── export/               # Exportação social (beta)
│   │   ├── auth/                 # Login, registro, configurações
│   │   ├── admin/                # Painel admin
│   │   └── analytics/            # Tracking
│   ├── components/               # Componentes reutilizáveis
│   ├── hooks/                    # Custom hooks (queries, mutations)
│   └── lib/                      # API client, schemas, utils
└── package.json

infra/                            # Infraestrutura
├── docker-compose.yml
├── nginx.conf
└── .env.example
```

---

## Como executar

### Com Docker (recomendado)

```bash
cd infra
cp .env.example .env              # configure suas API keys
docker compose up --build -d
```

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### Desenvolvimento local

```bash
# Backend
cd backend
./gradlew bootRun

# Frontend
cd frontend
npm install
npm run dev
```

---

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `POSTGRES_DB` | Nome do banco | `skywatch` |
| `POSTGRES_USER` | Usuário do banco | `skywatch` |
| `POSTGRES_PASSWORD` | Senha do banco | — |
| `JWT_SECRET` | Secret para tokens JWT | — |
| `NASA_API_KEY` | Chave da API NASA | `DEMO_KEY` |
| `ASTRONOMY_API_APP_ID` | App ID do AstronomyAPI | — |
| `ASTRONOMY_API_APP_SECRET` | App Secret do AstronomyAPI | — |
| `BLOB_READ_WRITE_TOKEN` | Token do Vercel Blob Storage | — |
| `VITE_ENABLE_EXPORT` | Habilitar exportação social | `false` |

---

## Licença

Este projeto é de uso pessoal e portfólio.
