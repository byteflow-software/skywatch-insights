# Feature Specification: Melhorias no Feed de Eventos - Status Inteligente, Comentários e Foto de Perfil

**Feature Branch**: `004-smart-status-comments-avatar`
**Created**: 2026-03-13
**Status**: Draft
**Input**: User description: "Substituir data redundante no card por status inteligente contextual, adicionar sistema de comentários por evento com exibição na home, e foto de perfil com Vercel Blob Storage."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Status Inteligente no Card de Evento (Priority: P1)

O usuário visualiza o feed de eventos na home e, ao invés de ver datas duplicadas (data absoluta + data relativa), vê a data absoluta à esquerda junto ao badge de tipo e um status contextual inteligente à direita que indica a urgência ou estado temporal do evento.

Os status possíveis são:
- **"Agora"** — quando o evento está dentro da janela de melhor visualização (bestWindow)
- **"Hoje"** — quando o evento começa hoje (mas não está na janela de observação)
- **"Amanhã"** — quando o evento começa amanhã
- **"Faltam N dias"** — contagem regressiva para eventos futuros (2+ dias)
- **"Faltam N horas"** — quando falta menos de 24 horas
- **Contagem regressiva em tempo real** — quando faltar 10 minutos ou menos para a janela de observação (ex: "09:45", "05:30")
- **"Encerrado"** — para eventos passados

**Why this priority**: O status inteligente melhora significativamente a experiência do usuário ao dar contexto temporal imediato sem redundância visual. É a mudança de maior impacto visual com menor complexidade técnica.

**Independent Test**: Pode ser testado isoladamente visualizando o feed com eventos em diferentes estados temporais e verificando que o status correto aparece para cada um.

**Acceptance Scenarios**:

1. **Given** um evento cuja janela de melhor visualização (bestWindow) inclui o momento atual, **When** o usuário visualiza o feed, **Then** o card exibe o badge "Agora" com destaque visual
2. **Given** um evento que começa hoje mas fora da janela de observação, **When** o usuário visualiza o feed, **Then** o card exibe "Hoje"
3. **Given** um evento que começa amanhã, **When** o usuário visualiza o feed, **Then** o card exibe "Amanhã"
4. **Given** um evento que começa em 5 dias, **When** o usuário visualiza o feed, **Then** o card exibe "Faltam 5 dias"
5. **Given** um evento que começa em 8 horas, **When** o usuário visualiza o feed, **Then** o card exibe "Faltam 8 horas"
6. **Given** um evento cuja janela de observação começa em 7 minutos, **When** o usuário visualiza o feed, **Then** o card exibe um timer em tempo real "07:00" que decrementa a cada segundo
7. **Given** um evento cuja data de término já passou, **When** o usuário visualiza o feed, **Then** o card exibe "Encerrado" com estilo visual atenuado
8. **Given** o card do evento, **When** o usuário visualiza, **Then** a data absoluta permanece à esquerda junto ao badge de tipo

---

### User Story 2 - Sistema de Comentários por Evento (Priority: P2)

Usuários autenticados podem comentar em eventos astronômicos. Na página inicial (feed), cada card de evento exibe até 3 comentários mais recentes com avatar, nome do autor e texto truncado. Na página de detalhe do evento, há uma seção completa de comentários com input para novo comentário, listagem paginada e opção de excluir próprios comentários.

**Why this priority**: Comentários adicionam engajamento social à plataforma, transformando-a de uma ferramenta informativa em uma comunidade. Depende apenas do backend já existente de autenticação.

**Independent Test**: Pode ser testado criando um comentário em um evento, verificando que aparece na listagem, e que o preview de 3 comentários aparece no feed da home.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado na página de detalhe de um evento, **When** digita um comentário (até 500 caracteres) e clica em enviar, **Then** o comentário aparece na listagem com seu nome e avatar
2. **Given** um evento com 5+ comentários, **When** o usuário visualiza o card no feed da home, **Then** são exibidos os 3 comentários mais recentes com avatar (24px), nome e texto truncado
3. **Given** um evento com mais de 3 comentários exibidos no feed, **When** o usuário vê o card, **Then** aparece um link "Ver todos os N comentários" que leva à página de detalhe
4. **Given** um usuário autenticado que fez um comentário, **When** clica em excluir no próprio comentário, **Then** o comentário é removido
5. **Given** um usuário não autenticado, **When** tenta comentar, **Then** é redirecionado para a página de login
6. **Given** um usuário autenticado, **When** tenta enviar um comentário com mais de 500 caracteres, **Then** o sistema impede o envio e exibe mensagem de limite
7. **Given** um evento com muitos comentários na página de detalhe, **When** o usuário rola a lista, **Then** comentários adicionais são carregados via paginação

---

### User Story 3 - Foto de Perfil com Vercel Blob (Priority: P3)

Usuários podem fazer upload de uma foto de perfil que é armazenada na nuvem via Vercel Blob Storage. A foto aparece nos comentários, no header da aplicação e em qualquer lugar onde o perfil do usuário é exibido. Quando não há foto, são exibidas as iniciais do nome do usuário como fallback.

**Why this priority**: A foto de perfil complementa o sistema de comentários (US2) ao dar identidade visual aos usuários. Requer integração com serviço externo (Vercel Blob), por isso tem prioridade menor.

**Independent Test**: Pode ser testado fazendo upload de uma imagem nas configurações e verificando que aparece no header e nos comentários.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado na página de configurações, **When** seleciona uma imagem e faz upload, **Then** a foto é armazenada via Vercel Blob e a URL é salva no perfil
2. **Given** um usuário com foto de perfil definida, **When** visualiza o header da aplicação, **Then** vê sua foto de perfil ao invés do ícone genérico
3. **Given** um usuário sem foto de perfil, **When** seu comentário é exibido, **Then** aparece um avatar com as iniciais do nome (ex: "RM" para "Ryan Moura")
4. **Given** um usuário com foto de perfil, **When** seu comentário é exibido no feed ou detalhe, **Then** a foto de perfil de 24px é mostrada ao lado do nome
5. **Given** um usuário fazendo upload de uma imagem maior que 5MB, **When** tenta enviar, **Then** o sistema rejeita com mensagem de erro sobre o tamanho máximo

---

### Edge Cases

- O que acontece quando a janela de melhor visualização (bestWindow) não está disponível para um evento que começa hoje? O status mostra "Hoje" ao invés de "Agora"
- O que acontece quando um comentário é excluído mas ainda aparece no cache do feed? O TanStack Query invalida a query de comentários do evento
- Como o timer de contagem regressiva se comporta quando o componente é desmontado? O interval é limpo via cleanup do useEffect
- O que acontece se o Vercel Blob estiver indisponível durante o upload? O sistema exibe erro amigável e permite retry
- O que acontece com comentários de um usuário que é excluído? Os comentários permanecem com informação de "Usuário removido"
- Como o sistema lida com URLs de avatar expiradas ou quebradas? Fallback para iniciais do nome via handler onError na tag img

## Requirements *(mandatory)*

### Functional Requirements

**Status Inteligente:**

- **FR-001**: Sistema DEVE substituir a data relativa redundante no lado direito do EventFeedCard por um status contextual inteligente
- **FR-002**: Sistema DEVE manter a data absoluta à esquerda junto ao badge de tipo do evento
- **FR-003**: Sistema DEVE exibir "Agora" quando o momento atual está dentro da janela de melhor visualização (bestWindow) do evento
- **FR-004**: Sistema DEVE exibir "Hoje" quando o evento começa hoje e não está na janela de observação
- **FR-005**: Sistema DEVE exibir "Amanhã" quando o evento começa no dia seguinte
- **FR-006**: Sistema DEVE exibir "Faltam N dias" quando faltam 2 ou mais dias para o evento
- **FR-007**: Sistema DEVE exibir "Faltam N horas" quando faltam menos de 24 horas para o evento
- **FR-008**: Sistema DEVE exibir um timer em tempo real (MM:SS) quando faltar 10 minutos ou menos para a janela de observação
- **FR-009**: Sistema DEVE exibir "Encerrado" com estilo visual atenuado para eventos passados

**Comentários:**

- **FR-010**: Sistema DEVE permitir que usuários autenticados criem comentários em eventos
- **FR-011**: Sistema DEVE limitar comentários a 500 caracteres
- **FR-012**: Sistema DEVE exibir até 3 comentários mais recentes no card do feed da home
- **FR-013**: Cada comentário no feed DEVE mostrar avatar do autor (24px), nome e texto truncado
- **FR-014**: Sistema DEVE exibir link "Ver todos os N comentários" quando houver mais de 3
- **FR-015**: Sistema DEVE fornecer listagem paginada de comentários na página de detalhe do evento
- **FR-016**: Sistema DEVE permitir que usuários excluam seus próprios comentários
- **FR-017**: Usuários não autenticados DEVEM ser redirecionados ao login ao tentar comentar
- **FR-018**: Sistema DEVE exibir comentários na página de detalhe com input para novo comentário

**Foto de Perfil:**

- **FR-019**: Sistema DEVE permitir upload de foto de perfil na página de configurações
- **FR-020**: Sistema DEVE armazenar imagens de avatar via Vercel Blob Storage
- **FR-021**: Sistema DEVE exibir a foto de perfil no header da aplicação
- **FR-022**: Sistema DEVE exibir fallback com iniciais do nome quando não houver foto de perfil
- **FR-023**: Sistema DEVE limitar o tamanho do upload a 5MB
- **FR-024**: Sistema DEVE aceitar formatos de imagem comuns (JPEG, PNG, WebP)

**Observações com Comentários:**

- **FR-025**: Sistema DEVE permitir comentários em observações, seguindo a mesma mecânica de comentários de eventos

### Key Entities

- **Comment**: Representa um comentário de usuário em um evento ou observação. Atributos: identificador único, referência ao evento/observação, referência ao autor, conteúdo textual (até 500 caracteres), data de criação
- **User (extensão)**: Campo adicional para URL do avatar armazenado externamente

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários conseguem identificar o estado temporal de um evento em menos de 2 segundos ao visualizar o feed
- **SC-002**: O timer de contagem regressiva atualiza em tempo real sem impacto perceptível na performance da página
- **SC-003**: Usuários conseguem criar e visualizar comentários em menos de 3 segundos
- **SC-004**: O feed da home carrega até 3 comentários por evento sem degradação perceptível no tempo de carregamento
- **SC-005**: Upload de avatar é completado em menos de 5 segundos para imagens de até 5MB
- **SC-006**: O fallback de iniciais do nome é exibido instantaneamente quando não há foto de perfil
- **SC-007**: 100% dos comentários exibidos no feed mostram avatar (foto ou iniciais) e nome do autor
