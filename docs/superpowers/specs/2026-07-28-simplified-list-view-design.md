# Lista de compras simplificada (sem modo mercado)

## Contexto

Feedback de que a tela da lista está poluída. O modo mercado existia para compensar densidade; a decisão é removê-lo e deixar uma lista padrão sólida e limpa.

## Decisões

| Tema | Decisão |
|------|---------|
| Modo mercado | Remover por completo |
| Ordenação | Fixa por categoria; sem UI de sort |
| Estimativa da compra | Remover da tela da lista |
| Preço na linha | Mantém input + toggle un/total |
| Último preço na lista | Remover hint, sugestão visual e autofill ao marcar |
| Linha do produto | Mantém emoji; remove subtítulo unidade · categoria |
| Adicionar produtos | Botão full-width, menor (altura/tipo) |
| Último preço na despensa | Fora desta entrega |

## Comportamento da lista

1. Header: voltar, nome, menu ⋮.
2. Itens agrupados por categoria (sem chips de ordenação).
3. Cada linha: checkbox, emoji, nome, quantidade (stepper ou valor se marcado), campos de preço.
4. Sem preenchimento automático de preço ao marcar; campo começa vazio.
5. Seção “Comprados” recolhível.
6. Botão “Finalizar compra” quando há itens marcados.
7. Barra inferior: “Adicionar produtos” mais compacta.

## Remoções técnicas

- `marketModeAtom` e usos em list-view, list-items, sort-bar, swipeable-item-row, market-mode-footer
- Componente `MarketModeFooter` (ou deixar de usar e remover arquivo)
- `ListItemsSortBar` na lista interativa (e possivelmente o componente se só servia isso; manter se ainda usado em priceOnly)
- Card de estimativa em `list-view.tsx`
- Autofill de último preço no client (`list-view` toggle + `autoFilledIds`) e no server (`toggleItemAction` se houver)
- Props/`lastPrice` hints em `ItemPriceFields` usados só para sugestão na lista
- Menções em FAQ e landing (`page.tsx`)

## Critérios de sucesso

- Lista legível sem chrome de sort/modo mercado/estimativa
- Preço ainda editável na linha, sem ruído de “último preço”
- Botão adicionar menos dominante
- Sem regressão em finalizar compra, swipe, sync, projetos
