# Lendário — Biblioteca Arcana

Guia rápido do sistema visual aplicado no app. O canvas de referência (telas, componentes
e movimento) foi desenhado antes da implementação; este arquivo resume o que o código usa.

## Marca

- **Nome:** Lendário · slogan *Estude como uma lenda*.
- **Símbolo:** a letra **L** desenhada como um dragão: o corpo é a haste, o topo vira cabeça
  com chifres, uma asa arcana nasce do vão, a base termina em cauda de lança e a estrela de
  quatro pontas é a aprovação.
- **Arquivos:** `assets/logo-mark.svg` (símbolo), `assets/app-icon.svg` (ícone do app),
  `assets/favicon.svg`, PNGs `icon-192`, `icon-512`, `maskable-512`, `apple-touch-icon`,
  `favicon-32` e `manifest.webmanifest` (PWA).
- **No código:** `<LogoMark size={40} />` e `<Wordmark size={17} tagline />` (em `brand.jsx`).
  Os caminhos do símbolo ficam em `window.LD_PATHS` (usados também no splash e nos cartões
  de compartilhamento desenhados em canvas).

> Identificadores técnicos antigos foram mantidos de propósito: chaves `toga_*` do
> localStorage, formato de licença `TOGA-XXXX-XXXX` e o protocolo da extensão
> (`TOGA_APP` / `TOGA_BLOCKER`). Renomeá-los apagaria dados e licenças de quem já usa.

## Cores (tokens em `styles.css`)

| Família | Tokens | Uso |
|---|---|---|
| Nanquim | `--ink-0…4` (#07060D → #2A2545) | fundos e superfícies |
| Folha de ouro | `--gold-1…4` (#F7E7C1 → #8A6428) | conquista, CTA principal, nível |
| Arcano | `--arc-1…5` (#C9C1FF → #34297F) | magia viva: XP, mana, dragão |
| Sinais | `--ember` #FF9A5A · `--jade` #4FD1A5 · `--rubi` #FF7A8A · `--moon` #8FB8FF | constância, acerto, erro, acento frio |
| Texto | `--parchment` #F3EBDD · `--text-muted` #B3ABC7 · `--text-heading` #F7E7C1 | leitura |

Os nomes antigos (`--petroleo`, `--ciano`, `--tinta`, `--grafite`…) continuam existindo,
remapeados para a nova paleta, para os componentes antigos seguirem funcionando.
Proporção em tela: ~80% nanquim · 12% pergaminho · 5% arcano · 3% ouro.

## Tipografia

- `--font-display` **Cormorant Garamond**: títulos, números heroicos, citações (classe `.font-display`).
- `--font-label` **Cinzel**: rótulos gravados, abas, selos, sempre em caixa alta com tracking largo.
- `--font-ui` / `--font-num` **Manrope**: leitura, dados e botões (números tabulares).

## Ícones

Nada de emoji na interface. `brand.jsx` traz ~100 ícones autorais (24×24, traço 1,6):

```jsx
<G name="flame" size={18} color="#FF9A5A" />   // ícone direto
<Glyph e="🔥" />                                  // converte um emoji do dado no ícone da marca
<GlyphText text="🎯 Metas" />                     // converte emojis dentro de um texto
```

`EMOJI_GLYPH` define o mapa emoji → ícone + cor semântica. Emojis sem equivalente continuam
como texto. Canvas (cartões de compartilhamento) e textos de legenda para redes mantêm emoji.

## Materiais e componentes

- **Obsidiana** `.glass` (cartões) · **Vidro arcano** `.glass-strong`, `.nav-bottom`, toasts.
- **Folha de ouro** `.btn-neon` (CTA principal, com reflexo a cada ~5 s) · `.btn-ghost` secundário.
- **Runas do edital** `.check-cell`: tracejada quando vazia, selo de ouro com carimbo ao marcar,
  arcano/rubi nas variantes.
- **Chips** `.ld-chip` (nível, cristais, constância com multiplicador da Chama).

## Movimento

- Curvas: `--ease-pena` (entradas), `--ease-feitico` (mola: toques, selos), `--ease-implode`.
- Troca de aba: `.ld-page` (virar de página, 620 ms).
- Ambiente: céu estrelado (`.dot-grid`), sigilo rúnico girando (`.ld-sigil`), chama (`.ld-flame`).
- Abertura (`splash.jsx`): o selo se desenha em ouro, uma vez por sessão.
- `prefers-reduced-motion` desliga loops de ambiente e brilhos.
