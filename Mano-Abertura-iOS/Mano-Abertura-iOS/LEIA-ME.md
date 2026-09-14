# Abertura MANÔ — integração SwiftUI + WKWebView + React

Este pacote contém uma implementação nativa do motion aprovado, para integração no projeto existente pelo Gemini Antigravity. Não é um projeto Xcode completo e ainda não foi testado dentro do aplicativo MANÔ.

## Entrega

- `ManoLaunchView.swift`: animação de 2,2 segundos em SwiftUI, sem player de vídeo.
- `ManoLaunchHost.swift`: mantém o conteúdo existente montado por baixo, aguarda o motion e o estado `.ready`, depois dissolve a abertura em 0,22 s.
- `ManoReadyMessageHandler.swift`: recebe o sinal de prontidão enviado pelo React.
- `notifyManoReady.ts`: sinaliza depois de duas oportunidades de pintura do navegador.
- `Assets.xcassets`: quatro camadas da logo original, com transparência e alinhamento comum. Copiar as quatro pastas `.imageset` para o catálogo existente; não substituir o catálogo do aplicativo.
- `Referencia-aprovada.mp4`: referência visual aprovada. Não precisa entrar no bundle do aplicativo.

Swift 6, iOS 16 ou superior. Sem bibliotecas externas. Os elementos da logo são PNGs em alta resolução; o movimento é código nativo. O desenho progressivo usa uma máscara de trajetória SwiftUI, portanto não é uma reprodução quadro a quadro do MP4. O estado final preserva o desenho original.

## Composição

Fundo branco, retângulo original preto, M branco, seta azul e nome MANÔ original. A largura total é 40,28% da tela, limitada a 240 pontos em telas grandes; equivale a 435 px no quadro aprovado de 1080 px. O conjunto fica centralizado na tela inteira. São preservados o acento, as proporções e o espaço entre retângulo e nome.

Retângulo: 0–0,35 s. M: 0,25–1,20 s. Seta: 0,95–1,45 s. Nome: 1,20–1,65 s. Repouso até 2,20 s. Com Reduzir Movimento habilitado, exibe a marca estática por 0,3 s e então pode sair.

## Integração pelo Antigravity

1. Adicionar os três arquivos Swift ao target iOS e os quatro imagesets ao Assets.xcassets existente.
2. No ContentView ou contêiner raiz, manter a WKWebView existente dentro de `ManoLaunchHost`. Não criar uma segunda WKWebView nem colocar a criação dela depois do splash.
3. Conectar `startupState` ao estado observado da camada nativa. Iniciar em `.loading`. No sinal validado do React, mudar para `.ready`. Em erros de navegação inicial, mudar para `.failed`.
4. Conectar `onRetry` à rotina existente: definir `.loading` e recarregar a WKWebView. O botão não recria o motion nem o contêiner inteiro.
5. Registrar `ManoReadyMessageHandler` sob o nome `manoLaunch`, uma única vez, na configuração da WKWebView antes de sua primeira navegação. Usar as origens reais e confiáveis que o projeto já utiliza, incluindo porta quando não padrão. Não inventar URL ou aceitar qualquer origem.
6. Usar captura fraca do coordenador/modelo no callback para não criar ciclo de retenção. Remover apenas o handler `manoLaunch` em `dismantleUIView`/limpeza da WebView, preservando os outros handlers.
7. Copiar o arquivo TypeScript para o frontend. Chamar `notifyManoReady` em um efeito quando a primeira interface utilizável existir. A existência do HTML (`didFinish`) não garante que o React terminou de montar.
8. Não aguardar todos os tiles do MapLibre, GPS autorizado, resposta da Sinetram ou dados remotos para sinalizar. A interface deve ter seu próprio estado de carregamento e erro. Caso o mapa seja a primeira tela, esperar o contêiner e controles essenciais, sem depender da conclusão de todas as requisições.
9. Manter a Launch Screen do iOS estática e branca. A animação acontece no SwiftUI após a tela de lançamento do sistema. Não colocar animações ou lógica na Launch Screen.
10. Manter o host estável na raiz. Não reapresentar em mudança de rota React, troca de aba ou simples retorno do background.

Se a WebView carrega arquivos locais via `file://` ou esquema próprio, adaptar explicitamente a validação de origem do handler ao carregamento local já existente. A classe entregue é voltada a origens HTTP/HTTPS conhecidas; não eliminar a validação indiscriminadamente.

Exemplo estrutural (adaptar aos nomes reais do projeto):

```swift
ManoLaunchHost(
    startupState: model.startupState,
    onRetry: { model.retryInitialLoad() }
) {
    ExistingWebView(/* parâmetros atuais */)
}
```

Registro na configuração existente, antes de carregar a página:

```swift
let readyHandler = ManoReadyMessageHandler(
    allowedOrigins: trustedOriginsFromProject
) { [weak model] in
    model?.startupState = .ready
}
configuration.userContentController.add(
    readyHandler, name: ManoReadyMessageHandler.name
)
```

O WKUserContentController retém o handler. Na limpeza da WebView:

```swift
webView.configuration.userContentController
    .removeScriptMessageHandler(forName: ManoReadyMessageHandler.name)
```

Exemplo React:

```tsx
useEffect(() => {
  if (!firstUsableScreenReady) return;
  return notifyManoReady();
}, [firstUsableScreenReady]);
```

## Falhas e espera

Se o React ainda não estiver pronto após o motion, a marca permanece com indicador de carregamento. Em falha inicial ou após 12 segundos, aparece “Tentar novamente”. Se o sinal de prontidão chegar depois, o host ainda pode encerrar normalmente. Encaminhar `didFail`, `didFailProvisionalNavigation` e falha do processo web à gestão de erro já existente. O host só cuida da abertura; erros depois dela pertencem ao fluxo normal do app.

## Validação

Os três arquivos Swift foram verificados pelo compilador em modo Swift 6 para iOS Simulator, com deployment target iOS 16. Isso valida tipos e compatibilidade de compilação, mas não substitui build, execução e revisão no projeto real. Não foram executados testes do backend nem do projeto React original, que não foram fornecidos.

Antes de publicar, conferir no app: abertura fria com React rápido; React lento; erro de navegação e tentar novamente; sinal atrasado; Reduzir Movimento; orientação/tamanhos suportados; ausência de splash duplicado; e manutenção da mesma instância da WKWebView.

Referências oficiais:
- https://developer.apple.com/design/human-interface-guidelines/launching
- https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
- https://developer.apple.com/documentation/webkit/wkusercontentcontroller/add(_:name:)
