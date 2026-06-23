# Bugs e Melhorias — Revisão de Código

Levantados em 22/06/2026 via revisão automatizada do diff atual.
Ordenados por prioridade: corrija de cima para baixo.

### 6. `atualizarPromocao` sempre deleta e recria combos/produtos, mesmo sem mudança

**Arquivo:** `backend/src/services/promocao.service.ts` — linhas ~143-164

**Problema:**
O `PromocaoForm` sempre envia `combos` e `produtos` no submit (nunca `undefined`). O backend interpreta `combos !== undefined` como "substituir tudo" e executa `deleteMany` + `createMany` mesmo quando nada mudou.

Isso funciona na prática, mas em cenário de concorrência (dois usuários editando a mesma promoção ao mesmo tempo), a janela entre o `deleteMany` e o `createMany` de uma transação pode fazer a outra transação sobrescrever o resultado da primeira.

**Fix (simples):** o frontend pode enviar `combos: undefined` quando não houver mudança, diferenciando "não toquei" de "limpei tudo". Exige rastrear se o usuário modificou a lista no formulário.

**Fix (alternativo):** no backend, comparar o estado atual com o novo antes de fazer o replace — só executa o delete+create se realmente houver diferença.

> Por ora é baixa prioridade. Só vira problema relevante com múltiplos usuários ativos no mesmo restaurante.

