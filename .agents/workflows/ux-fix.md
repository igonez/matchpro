---
description: Aplica as correções de UX do último /ux-audit e reavalia a nota
---

# /ux-fix

Aplica as correções apontadas pelo último relatório do `/ux-audit` nesta conversa. Se não houver relatório, rode primeiro o `/ux-audit`.

Argumento opcional: `alta`, `media`, `baixa` ou `tudo` (padrão: `alta`).

## Passos

1. Liste as correções que serão aplicadas e os arquivos afetados.
2. Aplique uma correção por vez, na ordem de prioridade, reutilizando componentes e tokens existentes (não crie estilos soltos).
3. Mantenha as mudanças pequenas e sem alterar a lógica de negócio.
4. Rode o lint e o type-check do projeto (`npm run lint` e `npx tsc --noEmit`) e corrija o que quebrar.
5. Refaça a avaliação apenas das leis afetadas e mostre a **nota antes vs. depois**.
6. Pergunte se deve continuar com as correções de prioridade MÉDIA e BAIXA.

## Regras

- Se uma correção exigir decisão de design (ex.: remover uma funcionalidade), pergunte antes.
- Se duas leis conflitarem, siga a recomendação do relatório e avise.
