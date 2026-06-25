# Roost — app

Implémentation de l'écran **« Le Monde — Mode Vie »** (+ la **Fiche Agent**) à partir du
handoff Claude Design. Stack : **Vite + React + TypeScript**, design tokens de marque
(crème / terracotta / teal, plumbob, vitals) comme source unique dans `src/index.css`.

## Développement

```bash
npm install
npm run dev          # http://localhost:5173 (HMR)
```

## Build de production

```bash
npm run build        # type-check (tsc) + bundle Vite → dist/
npm run serve        # sert dist/ sur http://localhost:4178 et ouvre le navigateur
```

## App native (Electron) — recommandé

L'app tourne dans une **fenêtre native dédiée** (Chromium embarqué), sans navigateur ni port.
Le raccourci **Roost** du Bureau (avec le logo) lance `Roost.exe`.

```bash
npm run app          # build + lance la fenêtre native (dev)
npm run dist:win     # build + empaquette release/Roost.exe (portable, ~88 Mo)
```

- Entrée Electron : `electron/main.cjs` (charge `dist/index.html` en `file://`).
- L'`.exe` installé : `%LOCALAPPDATA%\Roost\Roost.exe` ; le `.lnk` du Bureau pointe dessus.
- L'icône (`roost.ico`) est embarquée dans l'exe et utilisée par le raccourci.

> ⚠️ **OneDrive + Electron** : empaqueter *dans* un dossier synchronisé OneDrive (comme le
> Bureau) échoue avec `EPERM rename win-unpacked.tmp`. La sortie est donc dirigée hors OneDrive :
> `electron-builder --win portable -c.directories.output=%LOCALAPPDATA%\RoostBuild`.

## Lancer dans le navigateur (alternative)

`scripts/serve.mjs` sert `dist/` sur `http://localhost:4178` et ouvre le navigateur
(`npm run serve`). `Roost.vbs` faisait ça sans fenêtre console — conservé mais le raccourci
du Bureau utilise désormais l'app native.

> **Régénérer l'icône** : `npm run make-icon` recrée `roost.ico` depuis `public/favicon.svg`.

## Écrans & routes (par hash)

| Route | Écran |
|---|---|
| `#/` | **Le Monde — Mode Vie** (studio, scène, fiche agent) |
| `#/missions` | **Missions** — task board Kanban (drag & drop) |
| `#/revue` | **Revue** — diff viewer + revue groupée (`j/k/a/r`) |
| `#/analytics` | **Analytics** — métriques, graphes, reco de routing |
| `#/creer-agent` | **Créer un agent** — formulaire composable + aperçu live |
| `#/onboarding` | **Onboarding BYOK** — wizard 3 étapes (clés masquées) |
| `#/mobile` | **Mobile / PWA** — approbations tactiles |
| `#/parametres` | **Paramètres** — profil · clés · facturation · comptes liés · sécurité |
| `#/magasin` | **Magasin de compétences** — connecteurs MCP à attacher |
| `#/runs` | **Historique des runs** — table + timeline + replay |
| `#/equipe` | **Équipe** `[Team]` — membres, RBAC, présence, commentaires |
| `#/audit` | **Journal d'audit** `[Team]` — table filtrable + export CSV |
| `#/import` | **Importer un projet** — wizard de détection (règles · MCP · agents) |
| `#/conversations` | **Conversations** — historique de chat épinglable + reprise |
| `#/apercu` | **Aperçu live** — vue scindée Diff/Activité + rendu device |
| `#/recherche` | **Recherche globale** — résultats groupés (agents · missions · runs · artefacts) |
| `#/design-system` | **Planche Design System** |
| `#/timeline` | placeholder « bientôt » |

Overlays globaux : **⌘K** (palette de commandes) · **Nouvelle mission** (modale + pré-vol).

## Structure

```
src/
  App.tsx                  routeur (hash) + overlays (⌘K, mission) + motion
  useHashRoute.ts          routage par hash (zéro dépendance)
  WorldView.tsx            écran « Le Monde »
  ui/UiContext.tsx         actions globales (palette, mission, pause, stop)
  index.css                tokens de marque + keyframes + primitives
  data/                    agents · missions · classes · traits
  components/
    AppShell · Sidebar · TopBar                  (gabarit commun)
    NeedsAttention · Scene · FicheAgent          (studio)
    Missions · Revue · Analytics                 (écrans nav)
    CreateAgent · Onboarding · MobileView        (écrans V1)
    CommandPalette · NewMissionModal             (overlays)
    DesignSystem · ComingSoon
    AgentBody · Plumbob · MiniAgent · icons      (primitives)
electron/main.cjs          process principal (fenêtre native → dist/)
scripts/                   make-icon.mjs (SVG→ico) · serve.mjs (statique)
Roost.vbs                  lanceur navigateur masqué (alternative)
```

## Interactions

- **Connexion** — au lancement, un écran de bienvenue gate l'app : **email** (compte local persistant, mot de passe haché) ou **Google / Facebook / Apple**. Déconnexion depuis la barre latérale. *(L'OAuth social est simulé dans ce prototype ; le vrai branchement viendra avec le backend / Auth.js du Jalon 0.)*
- **Clé API réelle** — Paramètres → Clés API : « Tester » valide la clé contre l'API ; une clé Anthropic valide alimente le **chat en direct** de la Fiche Agent (onglet Chat). Réglages & profil persistés (localStorage).
- **Navigation** — la sidebar route chaque écran ; **⌘K / Ctrl+K** ouvre la palette.
- **Vie / Construction** (barre supérieure) — la grille iso teal apparaît ; en Construction, **glisse les agents** pour les replacer sur la Scène et **Recruter** un nouvel agent.
- **Clic sur un agent** (Scène) — ouvre sa **Fiche** (Activité / Chat / Aperçu) ; `Échap` ferme.
- **Missions** — glisse les cartes entre colonnes. **Revue** — `j/k` naviguer, `a` approuver, `r` rejeter.
- **Bouton ❙❙/► (bas-droite)** — coupe/réactive les animations (respecte `prefers-reduced-motion`).
