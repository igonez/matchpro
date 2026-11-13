---
description: Audita o app com as 20 leis de UX (somente leitura, não altera código)
---

# /ux-audit

Você é um revisor sênior de UX/UI. Esta é uma auditoria SOMENTE LEITURA: não edite nenhum arquivo.

Argumento opcional: rota, tela ou pasta para focar (ex.: `/ux-audit app/checkout`). Sem argumento, audite o app inteiro.

## Passos

1. **Mapear o app**: liste as rotas em `app/` (ou `pages/`), os componentes em `components/`, o layout raiz, o arquivo de estilos/tokens e o que existir de `loading.tsx`, `error.tsx`, `not-found.tsx`. Identifique o fluxo principal.
2. **Ler o código** das telas do fluxo principal antes de opinar. Se possível, abra o app no navegador e teste em largura mobile (360px) e desktop.
3. **Avaliar as 20 leis**, uma a uma:
   Hick, Fitts (tamanho), Jakob, Proximidade, Miller, Doherty, Von Restorff, Fitts (distância), Posição serial, Pico-fim, Zeigarnik, Occam, Tesler, Postel, Murphy, Semelhança, Conectividade uniforme, Parkinson, Carga cognitiva, Gradiente de meta.
4. **Para cada lei**, registre:
   - Status: ✅ Atende | ⚠️ Parcial | ❌ Não atende | ➖ Não se aplica
   - Evidência: arquivo e linha ou tela
   - Problema (se houver)
   - Correção específica
   - Prioridade: ALTA | MÉDIA | BAIXA
5. **Entregar o relatório** como artifact, com:
   - Nota geral de 0 a 10
   - Top 5 problemas críticos
   - Pontos fortes
   - Plano de correção em ordem de prioridade
6. **Parar e perguntar**: "Quer que eu rode `/ux-fix` para aplicar as correções de prioridade ALTA?"

## Verificações específicas de Next.js/React

- **Doherty**: existe `loading.tsx` ou `<Suspense>` nas rotas com dados? Formulários e mutações usam `useTransition`, `useActionState` ou `useOptimistic`? Botões têm estado de pending?
- **Murphy**: existe `error.tsx` e `not-found.tsx`? Listas têm estado vazio? Ações destrutivas pedem confirmação ou têm desfazer?
- **Fitts**: botões e links têm pelo menos 44x44px de área clicável?
- **Semelhança**: há componentes duplicados com estilos diferentes? Cores e espaçamentos vêm de tokens ou estão soltos no código?
- **Postel**: inputs usam `type`, `inputMode` e `autocomplete` corretos? Há validação com schema (zod) e normalização de formato?
- **Jakob**: navegação usa `next/link` e padrões familiares?
- **Carga cognitiva**: telas com muitos elementos concorrendo por atenção? Formulários longos sem etapas?

## Regras

- Seja direto e crítico. Não elogie por educação.
- Cite sempre o arquivo ou a tela específica.
- Se duas leis conflitarem (ex.: Occam vs. Zeigarnik), explique o trade-off e recomende o melhor para este app.
- Se faltar informação (ex.: não dá para medir latência), diga o que precisa em vez de chutar.
