# Meus Gados - Gerenciamento de Rebanho

<div align="center">

![Meus Gados](https://img.shields.io/badge/Meus%20Gados-Gerenciamento%20de%20Rebanho-blue?style=for-the-badge&logo=github)
![React Native](https://img.shields.io/badge/React%20Native-0.76-blue?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-52.0.0-black?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)
![NativeWind](https://img.shields.io/badge/NativeWind-4.0-blue?style=for-the-badge&logo=tailwindcss)

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

## 🚀 Instalação

### Pré-requisitos

- Node.js 18.x ou superior
- npm ou pnpm
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
# Usando pnpm (recomendado)
pnpm install

# Ou usando npm
npm install

# Ou usando yarn
yarn install
```

1. **Inicie o servidor de desenvolvimento**

```bash
# Usando pnpm
pnpm start

# Ou usando npm
npm start

# Ou usando expo
npx expo start
```

1. **Execute no emulador ou dispositivo**

- Pressione `a` para Android ou `i` para iOS
- Ou escaneie o QR code com o aplicativo Expo Go no dispositivo físico

### Build para Produção

```bash
# Gerar build para Android
eas build -p android

# Gerar build para iOS
eas build -p ios
```

## 🛠️ Tecnologias

O projeto utiliza as seguintes tecnologias e bibliotecas:

| Categoria     | Tecnologia              |
| ------------- | ----------------------- |
| Framework     | React Native            |
| Platform      | Expo                    |
| Language      | TypeScript              |
| Styling       | NativeWind (Tailwind)   |
| Navigation    | React Navigation        |
| Storage       | AsyncStorage            |
| Icons         | Expo Vector Icons       |
| Notifications | Expo Notifications      |
| Haptics       | Expo Haptics            |
| Reanimated    | React Native Reanimated |

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
# Notificações (Opcional para desenvolvimento local)
EXPO_NOTIFICATIONS_ANDROID_ICON=ic_notification
EXPO_NOTIFICATIONS_ANDROID_COLOR=#2563EB
```

### Temas

O aplicativo suporta temas claros e escuros automaticamente baseados nas configurações do sistema. As cores podem ser customizadas no arquivo `lib/theme-provider.tsx`.

## 🧪 Testes

```bash
# Executar testes unitários
pnpm test

# Executar testes com cobertura
pnpm test:coverage

# Verificar tipos TypeScript
pnpm type-check
```

## 📦 Build e Deploy

### Android (Google Play)

```bash
# Configurar conta EAS
eas login

# Configurar projeto
eas build:configure

# Gerar build de produção
eas build --platform android --profile production
```

### iOS (App Store)

```bash
# Gerar build de produção
eas build --platform ios --profile production
```

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes de Contribuição

- Siga os padrões de código existentes
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário
- Make sure all tests pass before submitting

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Lucas Felipe Costa**

- GitHub: [@seu-usuario](https://github.com/LFC94)

## 🙏 Agradecimentos

- [Expo](https://expo.dev/) - Framework React Native
- [React Native](https://reactnative.dev/) - Framework de desenvolvimento mobile
- [NativeWind](https://www.nativewind.dev/) - Utilitários Tailwind para React Native
- [React Navigation](https://reactnavigation.org/) - Biblioteca de navegação

---

<div align="center">

⭐ Se este projeto foi útil para você, considere dar uma estrela!

</div>
