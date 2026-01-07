# Design do Aplicativo Meus Gados

## Visão Geral
Aplicativo móvel para gerenciamento de rebanho bovino com foco em controle sanitário e reprodutivo. O app permite registrar e acompanhar informações individuais de cada animal, incluindo vacinas, gestação, partos e doenças.

## Orientação e Uso
- **Orientação**: Portrait (9:16) - uso vertical
- **Interação**: Otimizado para uso com uma mão
- **Plataforma**: iOS e Android seguindo Apple Human Interface Guidelines

## Estrutura de Telas

### 1. Home (Tela Principal)
**Conteúdo**:
- Resumo do rebanho: total de animais, gestações ativas, vacinas pendentes
- Cartões com acesso rápido às principais funcionalidades
- Lista resumida dos últimos animais cadastrados

**Funcionalidades**:
- Navegação para cadastro de novo animal
- Acesso rápido a vacinas pendentes
- Visualização de alertas importantes

### 2. Lista de Gado
**Conteúdo**:
- Lista completa de todos os animais cadastrados
- Cada item mostra: número, nome, raça, idade
- Barra de busca para filtrar por número ou nome
- Indicadores visuais para status (gestante, vacinação pendente, em tratamento)

**Funcionalidades**:
- Busca e filtro de animais
- Toque no item abre detalhes do animal
- Botão flutuante para adicionar novo animal

### 3. Detalhes do Animal
**Conteúdo**:
- Informações básicas: número, nome, raça, data de nascimento, peso atual
- Abas para organizar informações:
  - **Vacinas**: histórico e próximas doses
  - **Gestação/Parto**: registros de cobertura, gestações e partos
  - **Doenças**: histórico de diagnósticos e tratamentos
- Botão de edição para atualizar dados básicos

**Funcionalidades**:
- Navegação por abas
- Adicionar novo registro em cada categoria
- Editar informações básicas do animal
- Excluir animal (com confirmação)

### 4. Cadastro/Edição de Animal
**Conteúdo**:
- Formulário com campos:
  - Número do animal (obrigatório)
  - Nome (opcional)
  - Raça (seleção)
  - Data de nascimento (date picker)
  - Peso atual (kg)
- Botão de salvar e cancelar

**Funcionalidades**:
- Validação de campos obrigatórios
- Date picker nativo
- Teclado numérico para peso
- Salvar localmente no AsyncStorage

### 5. Adicionar Vacina
**Conteúdo**:
- Formulário modal ou tela completa:
  - Nome da vacina
  - Data de aplicação (date picker)
  - Próxima dose (date picker, opcional)
  - Lote da vacina
- Botões de salvar e cancelar

**Funcionalidades**:
- Associar vacina ao animal selecionado
- Calcular alertas para próximas doses
- Salvar no histórico do animal

### 6. Adicionar Gestação/Parto
**Conteúdo**:
- Formulário dividido em seções:
  - **Cobertura/Inseminação**: data
  - **Previsão de Parto**: data calculada automaticamente (280 dias) ou manual
  - **Resultado do Parto**: sucesso, complicações (após o parto)
  - **Bezerro Nascido**: botão para criar novo registro vinculado

**Funcionalidades**:
- Cálculo automático da data prevista de parto
- Criar novo animal (bezerro) vinculado à mãe
- Registrar complicações no parto
- Atualizar status da gestação

### 7. Adicionar Doença
**Conteúdo**:
- Formulário:
  - Tipo de doença
  - Data de diagnóstico (date picker)
  - Sintomas (texto longo)
  - Tratamento aplicado (texto longo)
  - Resultado (em tratamento, curado, óbito)

**Funcionalidades**:
- Registrar histórico médico completo
- Acompanhar evolução do tratamento
- Atualizar resultado do tratamento

### 8. Vacinas Pendentes
**Conteúdo**:
- Lista de animais com vacinas próximas ou atrasadas
- Ordenado por data (mais urgente primeiro)
- Cada item mostra: animal, vacina, data prevista

**Funcionalidades**:
- Marcar vacina como aplicada
- Navegar para detalhes do animal

### 9. Configurações
**Conteúdo**:
- Opções de tema (claro/escuro)
- Backup e restauração de dados
- Sobre o aplicativo

**Funcionalidades**:
- Alternar tema
- Exportar dados para arquivo JSON
- Importar dados de backup

## Fluxos Principais de Usuário

### Fluxo 1: Cadastrar Novo Animal
1. Usuário toca no botão "+" na tela Home ou Lista de Gado
2. Preenche formulário de cadastro
3. Toca em "Salvar"
4. Sistema valida dados e salva localmente
5. Retorna para Lista de Gado com novo animal visível

### Fluxo 2: Registrar Vacina
1. Usuário navega para Detalhes do Animal
2. Seleciona aba "Vacinas"
3. Toca em "Adicionar Vacina"
4. Preenche formulário de vacina
5. Toca em "Salvar"
6. Sistema salva e atualiza histórico
7. Retorna para aba Vacinas com novo registro

### Fluxo 3: Registrar Gestação e Parto
1. Usuário navega para Detalhes do Animal (vaca)
2. Seleciona aba "Gestação/Parto"
3. Toca em "Nova Gestação"
4. Registra data de cobertura/inseminação
5. Sistema calcula data prevista de parto automaticamente
6. Quando o parto ocorre, usuário edita o registro
7. Registra resultado do parto
8. Se sucesso, toca em "Cadastrar Bezerro"
9. Sistema cria novo animal vinculado à mãe
10. Retorna para lista com bezerro cadastrado

### Fluxo 4: Registrar Doença e Tratamento
1. Usuário navega para Detalhes do Animal
2. Seleciona aba "Doenças"
3. Toca em "Adicionar Doença"
4. Preenche diagnóstico, sintomas e tratamento
5. Define status como "Em Tratamento"
6. Toca em "Salvar"
7. Posteriormente, pode editar para atualizar resultado

## Escolhas de Cores

### Paleta de Cores Temática
- **Primary (Verde Pasto)**: `#2D7A3E` (light) / `#4CAF50` (dark)
  - Representa natureza, campo, saúde do rebanho
  - Usado em botões principais, destaques, ícones ativos

- **Background**: `#FFFFFF` (light) / `#151718` (dark)
  - Fundo principal das telas

- **Surface (Cinza Claro)**: `#F5F5F5` (light) / `#1E2022` (dark)
  - Cartões, cards, áreas elevadas

- **Foreground (Texto Principal)**: `#11181C` (light) / `#ECEDEE` (dark)
  - Texto principal, títulos

- **Muted (Texto Secundário)**: `#687076` (light) / `#9BA1A6` (dark)
  - Subtítulos, informações secundárias

- **Border**: `#E5E7EB` (light) / `#334155` (dark)
  - Bordas de cards e separadores

- **Success (Verde)**: `#22C55E` (light) / `#4ADE80` (dark)
  - Indicadores de sucesso, animais saudáveis

- **Warning (Amarelo)**: `#F59E0B` (light) / `#FBBF24` (dark)
  - Alertas de vacinas próximas, atenção necessária

- **Error (Vermelho)**: `#EF4444` (light) / `#F87171` (dark)
  - Vacinas atrasadas, doenças, problemas críticos

## Componentes Principais

### CattleCard
- Card para exibir resumo de um animal na lista
- Mostra número, nome, raça, ícones de status
- Toque abre detalhes

### VaccineItem
- Item de lista para histórico de vacinas
- Mostra nome, data aplicada, próxima dose
- Badge colorido para status (em dia, próximo, atrasado)

### PregnancyTimeline
- Componente visual para acompanhar gestação
- Linha do tempo desde cobertura até parto
- Indicador de progresso

### DiseaseRecord
- Card para registro de doença
- Mostra tipo, data, status do tratamento
- Expansível para ver detalhes completos

## Armazenamento de Dados

### Estrutura AsyncStorage
Todos os dados serão armazenados localmente usando AsyncStorage com as seguintes chaves:

- `@meus_gados:cattle` - Array de todos os animais
- `@meus_gados:vaccines` - Array de todas as vacinas
- `@meus_gados:pregnancies` - Array de gestações/partos
- `@meus_gados:diseases` - Array de doenças

### Relacionamentos
- Vacinas, gestações e doenças referenciam o animal pelo ID
- Bezerros têm campo `motherId` para vínculo com a mãe

## Considerações de UX

1. **Feedback Tátil**: Usar haptics em ações importantes (salvar, excluir)
2. **Confirmações**: Sempre confirmar exclusões
3. **Validação**: Validar campos obrigatórios antes de salvar
4. **Estados Vazios**: Mostrar mensagens amigáveis quando não há dados
5. **Carregamento**: Indicadores visuais durante operações de salvamento
6. **Acessibilidade**: Tamanhos de toque adequados (mínimo 44x44pt)
7. **Navegação**: Botão voltar sempre visível e funcional
