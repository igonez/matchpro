---
trigger: glob
globs: "**/*.{tsx,jsx,css}"
description: As 20 leis de UX que devem guiar toda interface criada ou alterada neste projeto (Next.js + React)
---

# Leis de UX (aplicar ao criar ou alterar qualquer tela/componente)

Antes de entregar qualquer UI, confira mentalmente esta lista. Se uma lei for violada de propósito, explique o motivo em uma linha.

## Decisão e escolha
1. **Hick**: poucas opções por tela. Agrupe, use menus enxutos, esconda ações secundárias em "mais".
5. **Miller**: quebre listas e formulários longos em blocos de ~5-9 itens ou em etapas.
12. **Occam**: se um elemento, texto ou etapa pode sair sem perda, remova.
19. **Carga cognitiva**: hierarquia visual clara, textos curtos, divulgação progressiva.

## Interação e alvos
2. **Fitts (tamanho)**: alvos clicáveis com no mínimo 44x44px (ex.: `min-h-11 min-w-11` no Tailwind).
8. **Fitts (distância)**: ações frequentes ao alcance do polegar no mobile; botões relacionados juntos.
7. **Von Restorff**: só UMA ação primária em destaque forte por tela.
3. **Jakob**: use padrões que o usuário já conhece (logo no topo, busca, navegação, ícones comuns). Não invente sem necessidade.

## Agrupamento visual (Gestalt)
4. **Proximidade**: o que é relacionado fica junto; o que não é, separado por espaçamento.
16. **Semelhança**: mesma função = mesmo visual (cor, ícone, estilo). Use componentes reutilizáveis e design tokens.
17. **Conectividade uniforme**: use cards, bordas e containers para conectar o que é do mesmo grupo.
9. **Posição serial**: itens mais importantes no início e no fim de listas e menus.

## Tempo e feedback
6. **Doherty (<400ms)**: feedback imediato. Em Next.js: `loading.tsx`, `<Suspense>` com skeleton, `useTransition`, `useOptimistic`, estado `pending` em botões.
18. **Parkinson**: fluxos curtos, autopreenchimento, defaults inteligentes, atalhos.

## Emoção e motivação
10. **Pico-fim**: capriche no momento de maior emoção e no final do fluxo (tela de sucesso, confirmação clara).
11. **Zeigarnik**: mostre tarefas incompletas (checklists, "falta 1 passo") para estimular a conclusão.
20. **Gradiente de meta**: progresso visível e recompensas parciais perto do objetivo.

## Robustez
13. **Tesler**: a complexidade vai para o sistema, não para o usuário (padrões inteligentes, detecção automática).
14. **Postel**: aceite formatos variados de entrada (telefone, CPF, datas, espaços) e normalize; entregue saídas limpas e consistentes. Valide com zod no cliente e no servidor.
15. **Murphy**: trate erro, vazio, carregando e offline. Em Next.js: `error.tsx`, `not-found.tsx`, estados vazios com CTA, confirmação e "desfazer" em ações destrutivas.

## Checklist rápido de componente novo
- [ ] Estados: carregando, vazio, erro, sucesso
- [ ] Alvo >= 44px, foco visível, `aria-label` em botões só com ícone
- [ ] Uma ação primária
- [ ] Usa componentes e tokens existentes (sem estilos soltos)
- [ ] Funciona em 360px de largura
