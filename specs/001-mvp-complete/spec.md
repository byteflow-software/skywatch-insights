# Feature Specification: SkyWatch Insights — MVP Completo

**Feature Branch**: `001-mvp-complete`
**Created**: 2026-03-09
**Status**: Draft
**Input**: User description: "Plataforma fullstack de monitoramento e previsão de observação astronômica com módulo de exportação social"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastro, Login e Configuração de Cidade (Priority: P1)

Como novo usuário, quero me cadastrar, fazer login e definir minha cidade principal para que o sistema me mostre eventos astronômicos relevantes à minha localização.

**Why this priority**: Sem autenticação e perfil configurado, nenhuma outra funcionalidade do sistema pode ser personalizada. É a porta de entrada obrigatória.

**Independent Test**: Criar conta, fazer login, configurar cidade e verificar que o dashboard exibe informações contextualizadas para a localidade escolhida.

**Acceptance Scenarios**:

1. **Given** um visitante não autenticado, **When** preenche nome, e-mail e senha válidos e submete o formulário de cadastro, **Then** a conta é criada e o usuário é redirecionado ao onboarding.
2. **Given** um usuário cadastrado, **When** faz login com credenciais corretas, **Then** recebe token JWT e acessa o dashboard.
3. **Given** um usuário no onboarding, **When** define cidade principal, fuso e interesses astronômicos, **Then** o dashboard passa a mostrar eventos contextualizados para sua localidade.
4. **Given** um usuário autenticado, **When** edita preferências de observação, idioma ou tema visual, **Then** as mudanças são refletidas imediatamente na interface.
5. **Given** um usuário autenticado, **When** clica em logout, **Then** a sessão é invalidada e o acesso restrito é bloqueado.

---

### User Story 2 - Exploração de Eventos Astronômicos (Priority: P1)

Como entusiasta de astronomia, quero navegar por eventos astronômicos futuros com filtros e ver detalhes completos de cada evento para planejar minhas observações.

**Why this priority**: Os eventos são o conteúdo central do produto. Sem eles, não há valor para o usuário.

**Independent Test**: Acessar listagem de eventos, aplicar filtros, abrir detalhe de um evento e verificar que exibe descrição, janela temporal e contexto observacional.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado no dashboard, **When** navega para a seção de eventos, **Then** vê lista de eventos futuros em formato de cards com título, tipo e data.
2. **Given** a lista de eventos, **When** aplica filtros por tipo (eclipse, chuva de meteoros, conjunção etc.), período ou cidade, **Then** a lista é atualizada mostrando apenas eventos correspondentes.
3. **Given** a lista de eventos, **When** clica em um evento específico, **Then** abre página de detalhe com resumo, descrição completa, janela temporal, tipo e assets visuais.
4. **Given** um evento com visualização em calendário, **When** alterna para modo calendário, **Then** os eventos são exibidos em formato de calendário mensal.

---

### User Story 3 - Score de Observabilidade e Melhores Horários (Priority: P1)

Como observador, quero saber o score de observabilidade de um evento para minha cidade e os melhores horários para observar, para que eu possa planejar quando e onde olhar o céu.

**Why this priority**: O score de observabilidade é o diferencial do produto — transforma dados brutos em recomendação útil e acionável.

**Independent Test**: Abrir detalhe de um evento, ver score de observabilidade calculado para a cidade do usuário, com indicação dos melhores horários e justificativa.

**Acceptance Scenarios**:

1. **Given** a página de detalhe de um evento, **When** o sistema calcula o score de observabilidade para a cidade do usuário, **Then** exibe o score numérico com indicador visual (bom/médio/ruim).
2. **Given** o score calculado, **When** o usuário consulta os melhores horários, **Then** vê janela ideal de observação com horário de início e fim.
3. **Given** uma atualização de dados climáticos, **When** o score é recalculado, **Then** o valor atualizado é refletido na interface.

---

### User Story 4 - Dashboard com Destaque Semanal (Priority: P1)

Como usuário recorrente, quero um dashboard que destaque os próximos eventos, o evento da semana e meus favoritos para ter uma visão rápida do que é relevante.

**Why this priority**: O dashboard é a tela principal e a primeira impressão após o login. Demonstra o valor do produto imediatamente.

**Independent Test**: Fazer login e verificar que o dashboard exibe cards de próximos eventos, destaque do evento da semana e lista de favoritos. Verificar estados vazios quando não há dados.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado, **When** acessa o dashboard, **Then** vê cards dos próximos eventos ordenados por proximidade temporal.
2. **Given** um evento da semana definido, **When** o dashboard carrega, **Then** exibe destaque visual com título, imagem, score e CTA.
3. **Given** o usuário tem eventos favoritos, **When** o dashboard carrega, **Then** exibe seção com seus favoritos.
4. **Given** um novo usuário sem favoritos, **When** acessa o dashboard, **Then** vê estado vazio amigável com sugestão de ação.

---

### User Story 5 - Favoritar Eventos (Priority: P2)

Como entusiasta, quero favoritar eventos para acompanhá-los facilmente e ter uma lista pessoal dos que mais me interessam.

**Why this priority**: Favoritos agregam personalização e retenção, mas dependem do motor de eventos estar funcional.

**Independent Test**: Favoritar um evento, verificar feedback imediato na UI, acessar tela de favoritos e ver o evento listado. Desfavoritar e confirmar remoção.

**Acceptance Scenarios**:

1. **Given** a página de detalhe de um evento, **When** o usuário clica em favoritar, **Then** o ícone muda imediatamente e o evento é adicionado à lista de favoritos.
2. **Given** um evento já favoritado, **When** o usuário clica em desfavoritar, **Then** o ícone reverte e o evento é removido da lista.
3. **Given** eventos favoritos existentes, **When** o usuário acessa a tela de favoritos, **Then** vê lista agrupada dos eventos salvos.

---

### User Story 6 - Exportação Social do Evento da Semana (Priority: P1)

Como criador de conteúdo, quero exportar o evento astronômico da semana em pacotes prontos para redes sociais (Instagram, Threads, X, LinkedIn) para publicar rapidamente sem criar conteúdo do zero.

**Why this priority**: A exportação social é o core diferenciador do produto. O kit "Evento Astronômico da Semana" é a prioridade máxima da constituição do projeto.

**Independent Test**: Selecionar o evento da semana, escolher rede social e formato, gerar pacote e verificar que contém arte visual + texto correspondente. Repetir para cada rede suportada.

**Acceptance Scenarios**:

1. **Given** o evento da semana na página de detalhe, **When** o usuário clica em "Exportar para redes sociais", **Then** abre interface de seleção de rede e formato.
2. **Given** a interface de exportação com Instagram Story selecionado, **When** o usuário gera o pacote, **Then** recebe imagem 9:16 com safe zones + legenda curta + hashtags.
3. **Given** a interface de exportação com Instagram Reels selecionado, **When** o usuário gera o pacote, **Then** recebe capa 9:16 + roteiro curto (3-5 blocos) + legenda.
4. **Given** a interface de exportação com Instagram Feed selecionado, **When** o usuário gera o pacote, **Then** recebe card retrato + legenda informativa.
5. **Given** a interface de exportação com Threads selecionado, **When** o usuário gera o pacote, **Then** recebe texto curto + versão expandida.
6. **Given** a interface de exportação com X selecionado, **When** o usuário gera o pacote, **Then** recebe post conciso + alternativa em thread (3-5 partes) respeitando limites da plataforma.
7. **Given** a interface de exportação com LinkedIn selecionado, **When** o usuário gera o pacote, **Then** recebe copy curta + copy técnica/analítica + outline de carrossel.
8. **Given** qualquer exportação gerada, **When** o pacote é produzido, **Then** inclui obrigatoriamente arte visual E texto correspondente (regra de ouro).
9. **Given** um pacote exportado, **When** o sistema salva o registro, **Then** a exportação aparece no histórico do usuário com data, evento, rede e template.

---

### User Story 7 - Personalização e Objetivos de Exportação (Priority: P2)

Como criador de conteúdo avançado, quero alternar o objetivo da copy (engajamento, educação, autoridade) e personalizar paleta, logo, CTA e assinatura para que o conteúdo reflita minha marca pessoal.

**Why this priority**: Agrega valor diferenciado mas depende do módulo de exportação base estar funcional.

**Independent Test**: Alterar objetivo da copy para "autoridade", personalizar paleta e CTA, gerar exportação e verificar que o tom e os elementos visuais refletem as escolhas.

**Acceptance Scenarios**:

1. **Given** a interface de exportação, **When** o usuário seleciona objetivo "engajamento", **Then** a copy gerada usa linguagem direta e CTAs orientados a interação.
2. **Given** a interface de exportação, **When** o usuário seleciona objetivo "educação", **Then** a copy gerada usa tom explicativo e dados contextuais.
3. **Given** a interface de exportação, **When** o usuário seleciona objetivo "autoridade", **Then** a copy gerada usa linguagem técnica e análise aprofundada.
4. **Given** configurações de personalização, **When** o usuário define paleta, logo, CTA e assinatura, **Then** as exportações futuras usam esses elementos.

---

### User Story 8 - Diário de Observações (Priority: P3)

Como observador do céu, quero registrar minhas observações com data, local, notas e fotos para manter um histórico pessoal das minhas experiências astronômicas.

**Why this priority**: Adiciona profundidade ao produto mas é independente do fluxo principal. Pode ser entregue após o core.

**Independent Test**: Criar entrada no diário com data, local, nota e foto. Acessar timeline pessoal e ver a entrada registrada.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado, **When** acessa a seção de diário e cria nova entrada com data, local, nota e resultado, **Then** a observação é salva com sucesso.
2. **Given** o formulário de observação, **When** o usuário anexa mídia (foto), **Then** o arquivo é armazenado e vinculado à entrada.
3. **Given** observações registradas, **When** o usuário acessa seu histórico, **Then** vê timeline pessoal ordenada cronologicamente.

---

### User Story 9 - Administração e Curadoria Editorial (Priority: P2)

Como administrador, quero destacar manualmente o evento da semana e revisar/editar eventos importados para manter a qualidade do conteúdo.

**Why this priority**: Essencial para a qualidade do conteúdo mas exige interface administrativa separada.

**Independent Test**: Acessar painel admin, destacar evento como "evento da semana", editar evento existente e ocultar evento inadequado.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado, **When** seleciona um evento e o marca como "Evento da Semana", **Then** o destaque é refletido no dashboard e na exportação social.
2. **Given** eventos importados, **When** o administrador edita título, descrição ou status, **Then** as alterações são salvas com registro de origem, usuário e timestamp.
3. **Given** um evento inadequado, **When** o administrador o oculta, **Then** ele não aparece para usuários finais mas o histórico de exportações e observações vinculadas é preservado.

---

### User Story 10 - Analytics Básico (Priority: P3)

Como administrador do produto, quero um painel simples com métricas de visualização, cliques e downloads para entender o uso e guiar a evolução do produto.

**Why this priority**: Informativo mas não bloqueante. Pode ser adicionado como última camada.

**Independent Test**: Acessar painel de analytics e verificar que exibe contadores de visualizações, cliques e downloads de exportações.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado, **When** acessa o painel de analytics, **Then** vê métricas de visualizações de eventos, cliques em exportações e downloads.
2. **Given** métricas coletadas, **When** o painel é carregado, **Then** exibe gráficos ou indicadores resumidos de uso.

---

### Edge Cases

- O que acontece quando o usuário tenta cadastrar com e-mail já existente? Sistema retorna erro claro sem expor informações sensíveis.
- Como o sistema se comporta quando a API de clima está indisponível? Exibe score parcial com aviso de dados incompletos e usa último dado disponível.
- O que acontece quando um evento expira durante a visualização? O status muda para "encerrado" sem remover o conteúdo.
- Como o sistema trata exportações para X quando o texto excede o limite? Sempre produz versão segura dentro do limite, independente de acesso a posts longos.
- O que acontece quando o usuário gera exportação de evento sem dados suficientes? Sistema gera pacote parcial com indicação dos campos faltantes.
- Como o sistema trata exclusão lógica de eventos? Não apaga histórico de exportações e observações vinculadas.

## Clarifications

### Session 2026-03-10

- Q: A home page deve ser pública (sem login) ou autenticada? → A: Pública — visível sem login, com CTAs para cadastro/login.
- Q: Quais seções devem aparecer na home page? → A: Eventos + Destaque da Semana + Condições astronômicas atuais — hero do evento da semana no topo, condições resumidas e lista de eventos.
- Q: Layout do feed de eventos na home? → A: Feed vertical em coluna única central (estilo Twitter/blog) com scroll infinito.
- Q: Interação de visitantes não logados na home? → A: CTAs de favoritar/exportar visíveis, ao clicar redireciona para login.
- Q: Condições astronômicas para visitantes sem cidade? → A: Usar cidade padrão (São Paulo) e exibir banner "Personalize para sua cidade".

### Session 2026-03-12

- Q: Experiência pós-login do usuário comum? → A: Mesma home `/` — detecta auth e habilita funcionalidades extras (favoritar, exportar, cidade personalizada, menu de perfil no nav).
- Q: Navegação para telas autenticadas? → A: Bottom nav fixo no rodapé com ícones (Home, Eventos, Favoritos, Observações, Perfil/Config). Visível apenas quando autenticado.
- Q: Design das telas autenticadas? → A: Todas dark theme (#050A18) — mesmo visual futurista da home, cards com bordas white/5, glassmorphism. Identidade visual coesa.
- Q: Acesso ao painel admin? → A: Link "Admin" no menu de perfil/configurações, visível somente para users com role ADMIN.
- Q: Tela de exportações para o usuário? → A: Exportar via detalhe do evento + histórico de exportações dentro da tela de Perfil/Config. Sem ícone dedicado no bottom nav.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE permitir cadastro com nome, e-mail e senha com hash forte.
- **FR-002**: Sistema DEVE autenticar via token com renovação segura de sessão.
- **FR-003**: Sistema DEVE invalidar sessão logicamente no logout.
- **FR-004**: Usuários DEVEM definir cidade principal, fuso e interesses astronômicos no onboarding.
- **FR-005**: Usuários DEVEM poder editar preferências de observação, idioma e tema visual.
- **FR-006**: Sistema DEVE armazenar eventos com título, slug, descrição, tipo, janela temporal, relevância e status.
- **FR-007**: Sistema DEVE listar eventos futuros em formato de calendário, lista e cards de destaque.
- **FR-008**: Sistema DEVE permitir filtrar eventos por tipo, período, relevância e cidade.
- **FR-009**: Sistema DEVE exibir página de detalhe com resumo, contexto observacional e assets visuais.
- **FR-010**: Sistema DEVE calcular score de observabilidade por evento e localidade considerando janela do evento, clima e visibilidade.
- **FR-011**: Sistema DEVE exibir melhores horários sugeridos para observação.
- **FR-012**: Sistema DEVE recalcular score quando houver atualização de clima, evento ou localidade.
- **FR-013**: Sistema DEVE destacar evento da semana automaticamente ou aceitar override editorial.
- **FR-014**: Usuários DEVEM poder favoritar e desfavoritar eventos com feedback imediato e persistência.
- **FR-015**: Sistema DEVE exibir lista dedicada de eventos favoritos agrupados.
- **FR-016**: ~~Dashboard~~ A home autenticada DEVE mostrar próximos eventos, evento da semana, favoritos e score resumido — mesma rota `/` com funcionalidades extras habilitadas por auth.
- **FR-017**: Todas as telas autenticadas DEVEM tratar estados vazios com sugestões de ação.
- **FR-018**: Sistema DEVE gerar pacotes de exportação social com arte visual + texto para cada rede (regra de ouro).
- **FR-019**: Sistema DEVE suportar templates específicos para Instagram Story (9:16), Reels (capa+roteiro+legenda), Feed (card retrato), Threads (curta+expandida), X (curta+thread) e LinkedIn (curta+técnica+carrossel).
- **FR-020**: Sistema DEVE permitir escolher rede social e formato antes de gerar exportação.
- **FR-021**: Sistema DEVE gerar kit "Evento Astronômico da Semana" com prioridade máxima.
- **FR-022**: Sistema DEVE permitir alternar objetivo da copy: engajamento, educação e autoridade.
- **FR-023**: Sistema DEVE aplicar safe zones para layouts verticais.
- **FR-024**: Sistema DEVE registrar toda exportação com data, usuário, evento, rede e template.
- **FR-025**: Sistema DEVE produzir saída segura para X independente de acesso a posts longos.
- **FR-026**: Para Reels, MVP gera capa, roteiro curto e legenda — não vídeo final.
- **FR-027**: Usuários DEVEM poder registrar observações com data, local, nota, resultado e mídia.
- **FR-028**: Sistema DEVE exibir histórico pessoal de observações em formato de timeline.
- **FR-029**: Administradores DEVEM poder destacar evento como "evento da semana" manualmente.
- **FR-030**: Administradores DEVEM poder revisar, editar e ocultar eventos importados.
- **FR-031**: Exclusão lógica de eventos DEVE preservar histórico de exportações e observações.
- **FR-032**: Sistema DEVE registrar métricas de visualização, cliques e downloads.
- **FR-033**: Sistema DEVE exibir painel simples de uso para apoiar evolução do produto.
- **FR-034**: Templates e limites de redes sociais DEVEM ser parametrizados para revisão futura.
- **FR-035**: Todo evento DEVE ter período de validade e status visível.
- **FR-036**: Sistema DEVE exibir home page pública (sem autenticação) na rota raiz `/` com layout minimalista estilo blog/rede social.
- **FR-037**: Home page DEVE exibir hero do evento da semana no topo, condições astronômicas resumidas (cidade padrão São Paulo para visitantes) e feed vertical de eventos em coluna única central com scroll infinito.
- **FR-038**: Home page DEVE exibir CTAs de favoritar/exportar nos cards; ao clicar sem estar logado, redireciona para login.
- **FR-039**: Seção de condições astronômicas na home DEVE exibir banner "Personalize para sua cidade" quando o visitante não tem cidade definida.
- **FR-040**: Todas as telas autenticadas DEVEM usar dark theme (#050A18) com visual futurista consistente com a home (glassmorphism, bordas white/5, gradientes azul-roxo).
- **FR-041**: Usuários autenticados DEVEM ver bottom nav fixo no rodapé com ícones: Home, Eventos, Favoritos, Observações, Perfil. Bottom nav NÃO aparece para visitantes.
- **FR-042**: Após login, usuário DEVE ser redirecionado para `/` (home) com funcionalidades autenticadas habilitadas (favoritar, exportar, cidade personalizada, condições personalizadas).
- **FR-043**: Rota `/dashboard` DEVE ser restrita a role ADMIN e funcionar como painel administrativo (curadoria editorial, analytics, gestão de eventos).
- **FR-044**: Link "Admin" DEVE aparecer na tela de Perfil/Configurações somente para users com role ADMIN.
- **FR-045**: Histórico de exportações DEVE ser acessível dentro da tela de Perfil/Configurações. Exportação é iniciada a partir do detalhe do evento.

### Key Entities

- **User**: Usuário do sistema com nome, email, senha (hash), role, timezone, cidade preferida e data de criação.
- **Location**: Localidade com nome, latitude, longitude, código de país e timezone.
- **AstronomicalEvent**: Evento astronômico com slug, título, tipo, descrição, janela temporal, score de relevância, status e fonte.
- **VisibilityForecast**: Previsão de visibilidade por evento e localidade com janela ideal, score de observabilidade e resumo climático.
- **Favorite**: Relação entre usuário e evento com timestamp de criação.
- **ObservationLog**: Registro de observação com data, local, notas, resultado e URL de mídia.
- **SocialExportTemplate**: Template parametrizado por rede, formato, objetivo, versão de layout e status ativo.
- **SocialExportJob**: Job de exportação com usuário, evento, rede, formato, status, caminho do bundle e timestamps.
- **EventHighlight**: Destaque editorial com tipo, janela de validade e nota editorial.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários completam cadastro, login e configuração de cidade em menos de 3 minutos.
- **SC-002**: Dashboard carrega com pelo menos 3 tipos de informação (próximos eventos, destaque semanal, score) em menos de 2 segundos.
- **SC-003**: Detalhe do evento exibe score de observabilidade, janela e melhores horários em menos de 1 segundo após abertura.
- **SC-004**: Favoritar/desfavoritar reflete na interface em menos de 500ms.
- **SC-005**: Exportação do evento da semana gera pacote completo (arte + texto) para pelo menos 4 redes (Instagram, Threads, X, LinkedIn) em menos de 10 segundos.
- **SC-006**: 100% das exportações produzem arte visual E texto correspondente (regra de ouro).
- **SC-007**: Pacotes exportados mantêm consistência visual (design tokens) e textual (tom coerente) em todas as redes.
- **SC-008**: Aplicação disponível publicamente com deploy funcional e documentação mínima de uso.
- **SC-009**: Filtros de eventos retornam resultados em menos de 1 segundo.
- **SC-010**: Sistema permanece funcional quando APIs externas (clima) estão indisponíveis, usando dados em cache ou parciais.
