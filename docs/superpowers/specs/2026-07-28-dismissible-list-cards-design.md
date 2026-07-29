# Cards de aviso exclusíveis na home de listas

## Contexto

Na tela inicial de listas (`/dashboard/lists`) existem dois cards de aviso:

1. **Itens em falta na despensa** — `PantryRestockCard`
2. **Sua lista de sempre** — `SuggestedListCard`

Hoje eles aparecem sempre que há dados relevantes. O usuário quer poder dispensá-los temporariamente.

## Decisões

| Aspecto | Decisão |
|--------|---------|
| Persistência | Some por **7 dias**, depois reaparece se ainda fizer sentido |
| Escopo | Por **household** (grupo) |
| Independência | Cada card tem dismiss próprio |
| Armazenamento | `localStorage` no cliente |
| Backend | Nenhuma mudança (actions, services, schema, cookies) |

## Comportamento e UI

- Botão **X** no canto superior direito de cada card, no mesmo padrão do `PushBanner` (`aria-label="Dispensar"`).
- Ao clicar: o card some imediatamente e grava o timestamp no `localStorage`.
- Durante 7 dias o card não reaparece naquele grupo; após o TTL, se os dados ainda existirem, o card volta.
- Antes da hidratação o card não é renderizado (evita mismatch SSR ↔ client), igual ao `PushBanner`.
- A page server continua decidindo se o card *pode* aparecer (há itens em falta / há sugestão). O card client decide se está *dispensado*.

## Implementação

### Hook reutilizável

Extrair a lógica de dismiss com TTL (hoje duplicável a partir de `PushBanner`) para um hook, por exemplo:

```ts
useDismissibleBanner(storageKey: string, dismissDays?: number)
// retorna { visible: boolean, dismiss: () => void }
```

- `visible === false` até hidratar e enquanto o dismiss estiver dentro do TTL.
- `dismiss()` grava `Date.now()` na chave e esconde o card.

### Chaves de storage

- Despensa: `poe_na_lista:pantry-restock-dismissed:{householdId}`
- Sugestão: `poe_na_lista:suggested-list-dismissed:{householdId}`

TTL padrão: `7` dias.

### Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/use-dismissible-banner.ts` (novo) | Hook com hidratação + localStorage + TTL |
| `src/features/pantry/components/pantry-restock-card.tsx` | Usa hook + botão X |
| `src/features/shopping-lists/components/suggested-list-card.tsx` | Usa hook + botão X |

Fora de escopo nesta entrega: refatorar o `PushBanner` para usar o mesmo hook (pode ser follow-up).

## Fora de escopo

- Sincronização entre dispositivos
- Preferências no banco / cookies
- Alterar quando os cards *aparecem* (regras de dados da despensa/sugestão)
- Botão textual “Agora não” (apenas o X, como nos cards de aviso da home)

## Critérios de sucesso

1. Usuário consegue fechar cada card com o X.
2. O card não volta por 7 dias no mesmo grupo/dispositivo.
3. Em outro household, o card continua aparecendo normalmente.
4. Após 7 dias, se ainda houver dados, o card reaparece.
5. Sem flash de conteúdo SSR inconsistente (hidratação).
