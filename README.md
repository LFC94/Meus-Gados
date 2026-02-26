# Meus Gados - Gerenciamento de Rebanho

<div align="center">

![Meus Gados](https://img.shields.io/badge/Meus%20Gados-Gerenciamento%20de%20Rebanho-blue?style=for-the-badge&logo=github)
![React Native](https://img.shields.io/badge/React%20Native-0.83-blue?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-55.0-black?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![NativeWind](https://img.shields.io/badge/NativeWind-4.2-blue?style=for-the-badge&logo=tailwindcss)

**Aplicativo móvel para gerenciamento completo do seu rebanho de bovinos**

[Funcionalidades](#funcionalidades) • [Instalação](#instalação) • [Tecnologias](#tecnologias) • [Contribuição](#contribuição)

</div>

---

## 📋 Sobre o Projeto

Meus Gados é um aplicativo móvel desenvolvido em React Native que permite o gerenciamento completo do seu rebanho de bovinos. Com uma interface moderna e intuitiva, você pode cadastrar animais, registrar vacunas, acompanhar gestações, controlar doenças e receber notificações sobre eventos importantes.

O aplicativo foi construído utilizando as melhores práticas de desenvolvimento mobile, com arquitetura escalável e código bem estruturado, facilitando manutenções futuras e adição de novas funcionalidades.

## ✨ Funcionalidades

### 🐄 Gerenciamento de Animais

- **Cadastro de Animais**: Registre bovinos com informações completas incluindo número de identificação, nome, raça, data de nascimento e peso
- **Lista do Rebanho**: Visualize todos os animais cadastrados com informações resumidas e status de saúde
- **Detalhes do Animal**: Acesse informações detalhadas de cada animal, incluindo histórico de vacunas, gestações e doenças
- **Edição e Exclusão**: Mantenha os dados atualizados com facilidade

### 💉 Controle de Vacinação

- **Registro de Vacinas**: Registre aplicações de vacunas com data, nome, lote e próxima dose
- **Catálogo de Vacinas**: Mantenha um catálogo com as vacinas mais utilizadas
- **Vacinas Pendentes**: Visualize rapidamente quais animais estão com vacunas atrasadas ou próximas do vencimento
- **Cálculo Automático**: O sistema calcula automaticamente a próxima dose com base no intervalo definido

### 🤰 Acompanhamento de Gestações

- **Registro de Gestação**: Cadastre gestações com data de cobertura e previsão de parto
- **Timeline Visual**: Acompanhe o progresso da gestação visualmente
- **Alertas de Parto**: Receba notificações antes da data prevista de parto
- **Registro de Nascimento**: Registre o parto e associe o bezerro à matriz

### 🩺 Controle de Doenças

- **Registro de Doenças**: Registre ocorrências de doenças com diagnóstico, tratamento e resultado
- **Acompanhamento de Tratamento**: Monitore animais em tratamento com data de início e previsão de alta
- **Histórico Completo**: Mantenha um histórico de todas as ocorrências de saúde do animal

### 🔔 Sistema de Notificações

- **Notificações Automáticas**: Receba lembretes para vacunas pendentes e partos próximos
- **Configurações Personalizáveis**: Defina quantos dias antes deseja ser notificado
- **Horário Configurável**: Escolha o horário preferencial para receber notificações
- **Lista de Agendadas**: Visualize todas as notificações agendadas

### ☁️ Sincronização e Nuvem

- **Sincronização Offline-First**: O aplicativo utiliza `AsyncStorage` como fonte local e sincroniza automaticamente com o Firebase Firestore quando há conexão.
- **Isolamento de Dados**: Cada usuário possui seu próprio espaço seguro na nuvem (`/users/{uid}`), garantindo total privacidade.
- **Merge Inteligente**: Uso de lógica de "Última Escrita Vence" (_Last Write Wins_) baseada em timestamps para resolver conflitos entre múltiplos dispositivos.
- **Sincronização Automática**: Os dados são sincronizados ao abrir o app e alguns segundos após qualquer modificação local.
- **Soft Delete**: Itens deletados localmente são marcados para posterior sincronização com a nuvem, garantindo consistência total.

## ⚠️ Firebase e Expo Go

Este projeto utiliza **@react-native-firebase** para autenticação e banco de dados. Esse módulo requer código nativo e **NÃO funciona no Expo Go padrão**.

Consulte a seção [Instalação](#instalação) para ver os comandos necessários.

> **Erro típico**: `Native module RNFBAppModule not found` - indica que você está tentando rodar no Expo Go.

## 🚀 Instalação

### Pré-requisitos

- Node.js 18.x ou superior
- npm
- Expo CLI (opcional, mas recomendado)
- Emulador Android/iOS ou dispositivo físico

### Passos de Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/LFC94/meus-gados.git
cd meus-gados
```

1. **Instale as dependências**

```bash
npm install
```

1. **Gere código nativo**

```bash
npx expo prebuild --platform android
```

1. **Compile e execute**

```bash
npx expo run:android
```

```bash
# Gerar build de desenvolvimento (Android)
npm run build:dev

# Gerar build para teste interno (Android APK)
npm run build:preview

# Gerar build de produção (Play Store AAB)
npm run build:prod
```

## 🛠️ Tecnologias

O projeto utiliza as seguintes tecnologias e bibliotecas:

| Categoria     | Tecnologia                  |
| ------------- | --------------------------- |
| Framework     | React Native                |
| Platform      | Expo                        |
| Language      | TypeScript                  |
| Styling       | NativeWind (Tailwind)       |
| Navigation    | React Navigation            |
| Storage       | AsyncStorage                |
| Icons         | Expo Vector Icons           |
| Backend       | Firebase (Auth & Firestore) |
| Google Login  | Google Sign-In SDK          |
| Notifications | Expo Notifications          |
| Haptics       | Expo Haptics                |
| Reanimated    | React Native Reanimated     |

### Principais Dependências

- **@react-navigation/native**: Navegação principal
- **@react-navigation/stack**: Navegação em pilha
- **@react-navigation/drawer**: Menu lateral
- **nativewind**: Utilitários Tailwind CSS
- **@react-native-async-storage/async-storage**: Armazenamento local
- **expo-notifications**: Sistema de notificações

## ⚙️ Configuração

### Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para configurações sensíveis. Crie um arquivo `.env` na raiz do projeto:

```env
# Google Authentication (Obrigatório para Firebase Auth)
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=seu_client_id.apps.googleusercontent.com
```

### Temas

O aplicativo suporta temas claros e escuros automaticamente baseados nas configurações do sistema. As cores podem ser customizadas no arquivo `lib/theme-provider.tsx`.

## 🧪 Testes

```bash
# Verificar tipos TypeScript
npm run check
```

### Scripts de Build (EAS)

O projeto está configurado com perfis específicos no `eas.json` para facilitar o fluxo de trabalho:

```bash
# 1. Login no Expo
eas login

# 2. Executar o build desejado
npm run build:dev      # APK de Desenvolvimento
npm run build:preview  # APK de Preview (Teste)
npm run build:prod     # AAB de Produção (Loja)
npm run build:local    # APK Local (baseado no perfil preview)
```

**Nota para Build Local:**
Para rodar `npm run build:local`, certifique-se de ter baixado suas credenciais do Expo (`npx eas-cli credentials`) e salvo o arquivo `release.keystore` em `android/app` e `credentials.json` na raiz (para popular `android/keystore.properties`).

```

Para iOS, utilize os comandos `eas build --platform ios` com o perfil desejado (`--profile production`).

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes de Contribuição

- Siga os padrões de código existentes
- Atualize a documentação quando necessário
- Certifique-se de que todos os testes passam antes de submeter

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Lucas Felipe Costa**

- GitHub: [@LFC94](https://github.com/LFC94)

## 🙏 Agradecimentos

- [Expo](https://expo.dev/) - Framework React Native
- [React Native](https://reactnative.dev/) - Framework de desenvolvimento mobile
- [NativeWind](https://www.nativewind.dev/) - Utilitários Tailwind para React Native
- [React Navigation](https://reactnavigation.org/) - Biblioteca de navegação

---

<div align="center">

⭐ Se este projeto foi útil para você, considere dar uma estrela!

</div>
```
