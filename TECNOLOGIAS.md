# Tecnologias Utilizadas - Meus Gados

## 📱 Framework Principal: Expo + React Native

### O que é?
**Expo** é uma plataforma que simplifica o desenvolvimento de aplicativos React Native, fornecendo ferramentas e serviços pré-configurados. **React Native** é um framework que permite escrever aplicativos móveis usando JavaScript/TypeScript.

### Por que foi escolhido?
- **Desenvolvimento multiplataforma**: Um único código funciona em iOS, Android e Web
- **Prototipagem rápida**: Expo permite testar o app sem compilar código nativo
- **Comunidade ativa**: Amplo suporte e muitas bibliotecas disponíveis
- **Custo reduzido**: Não precisa de máquinas Mac para compilar para iOS
- **Atualizações OTA**: Pode atualizar o app sem passar pela App Store
- **Perfeito para MVPs**: Ideal para validar ideias rapidamente

---

## 🎨 Estilização: NativeWind (Tailwind CSS)

### O que é?
**NativeWind** é uma implementação de **Tailwind CSS** para React Native, permitindo usar classes Tailwind familiares em componentes móveis.

### Por que foi escolhido?
- **Familiaridade**: Desenvolvedores web já conhecem Tailwind CSS
- **Consistência**: Mesmo sistema de design em web e mobile
- **Produtividade**: Escrever estilos é mais rápido com classes utilitárias
- **Tema automático**: Suporta dark mode nativamente
- **Sem CSS-in-JS**: Evita problemas de performance com styled-components

**Exemplo:**
```tsx
<View className="flex-1 items-center justify-center bg-primary p-4">
  <Text className="text-2xl font-bold text-white">Olá!</Text>
</View>
```

---

## 🗂️ Roteamento: Expo Router

### O que é?
**Expo Router** é um sistema de roteamento baseado em arquivos para React Native, similar ao Next.js.

### Por que foi escolhido?
- **Estrutura clara**: Pastas representam rotas automaticamente
- **Deep linking**: Suporta links profundos nativamente
- **Navegação intuitiva**: Fácil de entender e manter
- **Suporte a abas**: Integrado com navegação em abas
- **Type-safe**: Rotas tipadas com TypeScript

**Estrutura do projeto:**
```
app/
  (tabs)/
    index.tsx          → Tela Home
    _layout.tsx        → Layout com abas
  cattle/
    list.tsx           → Lista de animais
    [id].tsx           → Detalhes do animal
    add.tsx            → Cadastro de animal
  vaccines/
    add.tsx            → Adicionar vacina
  pregnancy/
    add.tsx            → Registrar gestação
  diseases/
    add.tsx            → Registrar doença
```

---

## 💾 Armazenamento Local: AsyncStorage

### O que é?
**AsyncStorage** é uma solução de armazenamento chave-valor assíncrono para React Native, similar ao localStorage do navegador.

### Por que foi escolhido?
- **Simplicidade**: Fácil de usar para dados locais
- **Performance**: Rápido para leitura e escrita
- **Persistência**: Dados permanecem após fechar o app
- **Sem servidor**: Não requer backend para funcionar
- **Privacidade**: Dados ficam apenas no dispositivo do usuário

**Como funciona:**
```typescript
// Salvar dados
await AsyncStorage.setItem('animais', JSON.stringify(animais));

// Recuperar dados
const dados = await AsyncStorage.getItem('animais');
const animais = JSON.parse(dados);
```

---

## 🔔 Notificações: expo-notifications

### O que é?
**expo-notifications** é uma biblioteca que permite agendar e receber notificações locais em iOS e Android.

### Por que foi escolhido?
- **Notificações locais**: Funciona sem servidor
- **Agendamento**: Pode agendar notificações para datas futuras
- **Nativo**: Usa APIs nativas do iOS e Android
- **Permissões automáticas**: Solicita permissões quando necessário
- **Integrado com Expo**: Funciona perfeitamente com Expo

**Exemplo de uso:**
```typescript
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Vacina Pendente",
    body: "Animal X precisa de vacinação",
  },
  trigger: {
    type: 'date',
    date: new Date('2024-02-15 09:00:00'),
  },
});
```

---

## 📅 Seleção de Datas: react-native-date-picker

### O que é?
**react-native-date-picker** é uma biblioteca que fornece um calendário visual para seleção de datas.

### Por que foi escolhido?
- **Calendário nativo**: Usa calendários nativos do iOS/Android
- **UX melhorada**: Melhor que campos de texto para datas
- **Validação**: Suporta datas mínimas e máximas
- **Formato consistente**: Exibe datas em dd/mm/yyyy
- **Responsivo**: Funciona bem em diferentes tamanhos de tela

**Características:**
- Modal para web
- Calendário nativo para iOS/Android
- Suporte a múltiplos idiomas
- Validação de intervalo de datas

---

## 🎯 Linguagem: TypeScript

### O que é?
**TypeScript** é um superset de JavaScript que adiciona tipagem estática.

### Por que foi escolhido?
- **Segurança**: Detecta erros em tempo de desenvolvimento
- **Autocompletar**: IDEs oferecem melhor sugestão de código
- **Documentação**: Tipos servem como documentação viva
- **Refatoração segura**: Mudanças são mais seguras
- **Padrão da indústria**: Usado em projetos profissionais

**Exemplo:**
```typescript
interface Animal {
  id: string;
  number: string;
  name: string;
  breed: string;
  birthDate: string;
  weight: number;
}

function adicionarAnimal(animal: Animal): Promise<void> {
  // TypeScript garante que animal tem todas as propriedades
}
```

---

## 🧪 Testes: Vitest

### O que é?
**Vitest** é um framework de testes unitários rápido e moderno para JavaScript/TypeScript.

### Por que foi escolhido?
- **Rápido**: Compilação e execução otimizadas
- **Compatível com Jest**: Sintaxe familiar
- **ESM nativo**: Suporta módulos ES6
- **Watch mode**: Reexecuta testes ao salvar arquivos
- **Integrado com Vite**: Funciona bem com ferramentas modernas

---

## 🎨 Ícones: Expo Vector Icons

### O que é?
**Expo Vector Icons** fornece acesso a múltiplas bibliotecas de ícones vetoriais (Material Icons, FontAwesome, etc.).

### Por que foi escolhido?
- **Muitos ícones**: Acesso a milhares de ícones
- **Escalável**: Ícones vetoriais não pixelizam
- **Leve**: Apenas os ícones usados são incluídos
- **Nativo**: Renderiza como componentes React Native
- **Sem dependências externas**: Vem com Expo

---

## 🔐 Segurança: Expo Secure Store

### O que é?
**Expo Secure Store** armazena dados sensíveis de forma criptografada no dispositivo.

### Por que foi escolhido?
- **Criptografia**: Dados sensíveis são protegidos
- **Nativo**: Usa Keychain (iOS) e Keystore (Android)
- **Seguro**: Não pode ser acessado por outros apps
- **Simples**: API fácil de usar

---

## 🚀 Compilação: Metro Bundler

### O que é?
**Metro** é o bundler JavaScript padrão do React Native.

### Por que foi escolhido?
- **Otimizado para mobile**: Compilação rápida
- **Padrão**: Vem com React Native
- **HMR**: Hot Module Replacement para desenvolvimento rápido
- **Suporte a Web**: Funciona também para web via Expo

---

## 📦 Gerenciador de Pacotes: pnpm

### O que é?
**pnpm** é um gerenciador de pacotes rápido e eficiente para Node.js.

### Por que foi escolhido?
- **Rápido**: Mais rápido que npm e yarn
- **Espaço em disco**: Usa hard links para economizar espaço
- **Determinístico**: Mesmas versões em todos os ambientes
- **Monorepo**: Suporta workspaces
- **Compatível**: Funciona com qualquer pacote npm

---

## 🏗️ Arquitetura: Context API + AsyncStorage

### O que é?
**Context API** é o sistema de gerenciamento de estado nativo do React.

### Por que foi escolhido?
- **Sem dependências**: Não precisa de Redux ou Zustand
- **Simples**: Fácil de aprender e manter
- **Performance**: Suficiente para este app
- **Integrado**: Vem com React
- **Escalável**: Pode crescer conforme necessário

**Padrão usado:**
```typescript
// 1. Criar contexto
const CattleContext = createContext<CattleContextType | undefined>(undefined);

// 2. Criar provider
export function CattleProvider({ children }) {
  const [cattle, setCattle] = useState<Cattle[]>([]);
  
  return (
    <CattleContext.Provider value={{ cattle, setCattle }}>
      {children}
    </CattleContext.Provider>
  );
}

// 3. Usar em componentes
const { cattle } = useContext(CattleContext);
```

---

## 📊 Comparação com Alternativas

| Aspecto | Expo | Flutter | Nativo |
|--------|------|---------|--------|
| **Linguagem** | JavaScript | Dart | Swift/Kotlin |
| **Curva aprendizado** | Baixa | Média | Alta |
| **Desenvolvimento** | Rápido | Rápido | Lento |
| **Performance** | Boa | Excelente | Excelente |
| **Comunidade** | Grande | Grande | Muito grande |
| **Custo** | Gratuito | Gratuito | Gratuito |
| **Prototipagem** | Excelente | Boa | Ruim |

**Por que Expo foi escolhido:**
- Prototipagem rápida (MVP)
- Equipe com experiência em JavaScript
- Necessidade de Web também
- Custo-benefício

---

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────┐
│         Componente React                │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Context API (Estado Global)        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    AsyncStorage (Persistência Local)    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Dispositivo do Usuário (JSON)      │
└─────────────────────────────────────────┘
```

---

## 📱 Suporte a Plataformas

| Plataforma | Status | Notas |
|-----------|--------|-------|
| **iOS** | ✅ Suportado | Requer Xcode para compilar |
| **Android** | ✅ Suportado | Requer Android Studio |
| **Web** | ✅ Suportado | Funciona em navegadores |
| **Expo Go** | ✅ Suportado | Teste rápido no dispositivo |

---

## 🚀 Próximas Tecnologias Sugeridas

Se o app crescer, considere adicionar:

1. **Backend**: Node.js + Express + PostgreSQL
   - Para sincronizar dados entre dispositivos
   - Para backup na nuvem

2. **Autenticação**: Firebase Auth ou Auth0
   - Para múltiplos usuários
   - Para sincronização de dados

3. **Análise**: Sentry ou LogRocket
   - Para monitorar erros em produção
   - Para entender uso do app

4. **Testes E2E**: Detox
   - Para testar fluxos completos
   - Para CI/CD automatizado

---

## 📚 Recursos Úteis

- **Documentação Expo**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **Tailwind CSS**: https://tailwindcss.com
- **TypeScript**: https://www.typescriptlang.org
- **Vitest**: https://vitest.dev

---

## ✅ Resumo

O Meus Gados foi construído com tecnologias **modernas, escaláveis e focadas em desenvolvimento rápido**. A escolha de Expo + React Native permite que o app funcione em múltiplas plataformas com um único código, enquanto AsyncStorage garante que os dados do usuário permaneçam privados e locais. O uso de TypeScript e testes automatizados garante qualidade e manutenibilidade do código.

**Stack escolhido:**
- **Frontend**: React Native + Expo
- **Estilo**: Tailwind CSS (NativeWind)
- **Estado**: Context API
- **Persistência**: AsyncStorage
- **Notificações**: expo-notifications
- **Linguagem**: TypeScript
- **Testes**: Vitest

Esta é uma **arquitetura sólida para um MVP** que pode crescer conforme as necessidades do negócio evoluem.
