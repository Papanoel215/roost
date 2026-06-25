# Spécification produit détaillée — **AgentSims** (prompt Claude Code)

Plateforme **hébergée (multi-tenant)** de gestion d'agents IA façon *Les Sims* : je me connecte, je configure une équipe d'agents (les « Sims »), je leur assigne des missions, et je les regarde travailler en temps réel — certains propulsés par **Claude (Claude Agent SDK)**, d'autres par **Gemini/Antigravity (Interactions API)** — pour démultiplier mon travail de dev.

---

## 0. Consignes d'exécution (pour toi, Claude Code)

- **Lis tout ce document avant de coder.** Puis renvoie-moi un **plan d'exécution court** (jalons + ordre) et attends mon feu vert.
- **Construis par jalons** (§10). À chaque jalon, livre quelque chose qui **tourne** et **coche les critères d'acceptation** correspondants.
- **Écris des tests** pour chaque critère d'acceptation marqué `- [ ]` (unitaires + e2e Playwright pour les écrans clés).
- **Vérifie la doc officielle à jour** avant d'intégrer une API externe : Claude Agent SDK et Gemini/Antigravity évoluent vite et certains identifiants ci-dessous sont en *preview*. Les snippets sont des indications de **forme**, pas du copier-coller.
- **TypeScript de bout en bout** (frontend + orchestrateur). Respecte le **glossaire (§2)** : utilise exactement ces noms dans le code (types, tables, routes).
- **Demande-moi avant toute opération destructrice** (suppression de fichiers hors workspace, `git push`, migration destructive).
- **Sécurité non négociable** : aucun code utilisateur ne s'exécute sur l'hôte partagé (§4.3, §9). Aucun secret en clair (logs inclus).
- **Marqueurs de périmètre** : `[MVP]` = à faire dans les jalons 0→3 ; `[v2]` = après. Construis d'abord tout le `[MVP]`.

---

## 1. Principes directeurs

1. **Utile avant ludique.** La métaphore Sims sert la lisibilité (savoir d'un coup d'œil qui bosse, qui est bloqué, qui coûte cher), jamais l'inverse.
2. **Temps réel partout.** Tout ce qu'un agent fait apparaît en direct (streaming), pas en polling.
3. **Sandbox par défaut.** Chaque run s'exécute dans un environnement isolé et éphémère, détruit à la fin.
4. **BYOK (Bring Your Own Keys).** Chaque utilisateur apporte ses clés API → coûts attribués au bon compte, jamais les clés de la plateforme.
5. **Observabilité totale + contrôle.** Je peux à tout moment voir le détail, intervenir, approuver, annuler, revenir en arrière.

---

## 2. Glossaire (terminologie figée — à respecter dans le code)

| Terme | Définition |
|---|---|
| **Agent** (alias *Sim*) | Une entité IA configurée (modèle + persona + permissions + outils). Persistante. |
| **Engine** | Le moteur qui exécute l'agent : `claude` ou `gemini`. |
| **Mission** | Une unité de travail demandée à un agent (un prompt + un workspace cible + des critères). |
| **Run** | Une exécution concrète d'une mission par un agent (a un cycle de vie, un `sessionId` moteur, des événements, un coût). |
| **Event** (`AgentEvent`) | Un événement normalisé émis pendant un run (voir §4.5). |
| **Artifact** | Un livrable produit par un run à réviser (diff, plan, capture, rapport). |
| **Approval** | Une décision humaine sur un artifact ou une permission (`allow`/`deny`/`retry`). |
| **Vitals** | Les 4 « besoins » calculés d'un agent : Énergie, Motivation, Humeur, Clarté (§7). |
| **Plumbob** | L'indicateur de santé agrégé : 🟢/🟡/🔴 (§7). |
| **Workspace** | Le dossier de projet sur lequel travaille une mission (lié à un repo). |
| **Sandbox** | L'environnement d'exécution isolé et éphémère d'un run. |
| **Household / Team** | Un groupe d'agents qui collaborent (templates d'équipe). |
| **Recette** | Un template de mission paramétrable et réutilisable. |

---

## 3. Persona & parcours principal (à supporter de bout en bout)

**Persona :** dev/maker solo qui pilote plusieurs agents en parallèle sans jongler entre dix terminaux.

**Parcours cible (« golden path ») :**
1. Je me connecte (Google ou email).
2. J'ajoute mes clés (Anthropic + Gemini) → chiffrées.
3. Je connecte un workspace (repo GitHub).
4. Je crée un agent « Codeur » (Claude/Sonnet) et un agent « Testeur » (Gemini/Flash).
5. Je crée une mission, je la **glisse** sur le Codeur ; je vois l'**estimation** coût/durée ; je lance.
6. Je vois ses **étapes, pensées, fichiers modifiés** en direct dans **Le Monde** et dans sa fiche.
7. Il me **demande une permission** (commande shell) → je l'**approuve** depuis le dashboard.
8. Il finit → produit un **diff + résumé** → je **révise et approuve** → PR ouverte.
9. Le **coût** s'affiche, les **Vitals** se mettent à jour, le **standup** du soir résume la journée.

---

## 4. Architecture technique

### 4.1 Vue d'ensemble (composants & responsabilités)

- **Web app (Next.js, App Router)** — UI + auth + routes API. Rendu temps réel via client WebSocket.
- **Orchestrateur (service Node/TS)** — cœur métier : crée/pilote les **runs**, héberge les **Engines**, normalise les **AgentEvents**, gère permissions/coûts/approbations. Peut être le même process Next (route handlers + worker) au début, séparable ensuite.
- **Workers (BullMQ)** — exécutent les runs hors du cycle requête/réponse ; un run = un job.
- **Provisionneur de sandbox** — alloue/détruit un environnement isolé par run (§4.3).
- **Realtime hub** — diffuse les événements aux clients abonnés (WebSocket, §4.4).
- **Stores** — Postgres (état), Redis (queue + pub/sub temps réel), Object storage S3/R2 (artefacts, logs bruts, snapshots).

### 4.2 Stack figée

- **Front** : Next.js + React + TypeScript + Tailwind + **shadcn/ui** + **framer-motion** + **TanStack Query** (data) + **Zustand** (état UI local) + **dnd-kit** (drag & drop) + **cmdk** (palette ⌘K) + **Recharts** (analytics).
- **Back** : Node/TS, **Prisma** + Postgres, **BullMQ** + Redis, **Zod** (validation de tous les payloads), **Auth.js** (NextAuth).
- **Moteurs** : `@anthropic-ai/claude-agent-sdk` ; Gemini API (Interactions API) via le SDK officiel.
- **Sandbox** : un service managé (E2B / Daytona / Modal / Fly Machines) **ou** microVM maison (Firecracker). À choisir au Jalon 3 ; abstraire derrière une interface `SandboxProvider` (§4.3).
- **Temps réel** : WebSocket (lib `ws` côté serveur, ou Ably/Pusher managé si plus simple à scaler).

### 4.3 Multi-tenant & cycle de vie d'un sandbox

Interface à implémenter :
```ts
interface SandboxProvider {
  create(opts: { userId: string; workspaceRef: string; image?: string }): Promise<Sandbox>;
  exec(sandboxId: string, cmd: string): Promise<ExecResult>;     // pour outils contrôlés
  writeFiles(sandboxId: string, files: FileSpec[]): Promise<void>;
  snapshot(sandboxId: string): Promise<string>;                  // -> snapshotRef
  restore(snapshotRef: string): Promise<Sandbox>;
  destroy(sandboxId: string): Promise<void>;
}
```
Cycle de vie d'un **run** :
1. `run.created` → on **provisionne** un sandbox pour `userId`, on y monte le `workspace` (clone du repo à la bonne branche).
2. On prend un **snapshot** initial (pour rollback) → `snapshotRef`.
3. L'Engine tourne **dans/contre** le sandbox (Claude SDK exécute ses outils via le sandbox ; Gemini exécute dans le sandbox distant de Google).
4. En fin de run (succès/échec/annulation) → on **détruit** le sandbox (les artefacts/logs ont été persistés dans l'object storage).

Garanties : **un sandbox par run**, **jamais partagé entre comptes**, **egress réseau filtré**, **jamais d'exécution sur l'hôte**.
> Note : l'**Interactions API Gemini exécute déjà dans un sandbox Linux distant chez Google** → pour les agents Gemini, le `SandboxProvider` sert surtout au clone/diff/PR du workspace, pas à l'exécution du code de l'agent. Côté **Claude**, le Agent SDK tourne dans **ton** sandbox par-run (ou délègue à une option Claude Code hébergée si elle existe — à vérifier).

### 4.4 Protocole temps réel

- WebSocket `/ws`. Le client s'authentifie (jeton de session) puis **s'abonne** à son canal utilisateur `user:<userId>` (reçoit tout) et, optionnellement, à `run:<runId>` (détail).
- Le serveur **pousse** des enveloppes : `{ channel, kind: "event" | "notification" | "vitals", data }` où `data` est un `AgentEvent`, une `Notification`, ou un `VitalsSnapshot`.
- Le **contrôle** (lancer, annuler, approuver, message) passe par l'**API REST** (§4.7), pas par le WS. Le WS est **entrant uniquement** (stream serveur→client).
- Redis pub/sub relie workers → hub → clients. Tout `AgentEvent` est **persisté** (Postgres) **avant** diffusion → pas de perte, et **replay** possible (§6.8/§6.15).

### 4.5 Contrat d'événements normalisés `AgentEvent`

L'UI ne sait **jamais** quel moteur tourne derrière : chaque Engine traduit ses signaux natifs en ces types.
```ts
type AgentEventType =
  | "run.started"        // run créé, sandbox en cours de provisioning
  | "run.ready"          // sandbox prêt, boucle agent démarrée
  | "plan.created"       // payload: { steps: {id,title}[] }
  | "plan.step.started"  // payload: { stepId }
  | "plan.step.done"     // payload: { stepId, status: "ok"|"failed" }
  | "thought"            // payload: { text }  → bulle de pensée
  | "tool.call"          // payload: { callId, name, inputPreview }
  | "tool.result"        // payload: { callId, status:"ok"|"error", summary }
  | "file.changed"       // payload: { path, change:"created"|"modified"|"deleted", added, removed }
  | "permission.requested" // payload: { permissionId, action, risk:"low"|"medium"|"high", detail }
  | "permission.resolved"  // payload: { permissionId, decision:"allow"|"deny" }
  | "output"             // payload: { textChunk }  → sortie texte de l'agent
  | "cost.update"        // payload: { inputTokens, outputTokens, costUsdDelta }
  | "artifact.created"   // payload: { artifactId, type:"diff"|"plan"|"screenshot"|"report", ref }
  | "run.blocked"        // payload: { reason:"awaiting_permission"|"stalled"|"loop"|"rate_limited" }
  | "run.failed"         // payload: { message, recoverable:boolean }
  | "run.completed";     // payload: { summary, totalCostUsd, durationMs, artifactIds }

interface AgentEvent {
  id: string;
  runId: string;
  agentId: string;
  seq: number;     // entier monotone par run (ordre + replay)
  ts: string;      // ISO-8601
  type: AgentEventType;
  payload: Record<string, unknown>;  // typé selon `type` (valider avec Zod)
}
```

### 4.6 Interface `AgentEngine` (à implémenter pour Claude et Gemini)

```ts
interface AgentEngine {
  readonly id: "claude" | "gemini";
  startRun(input: StartRunInput): AsyncIterable<AgentEvent>;
  resumeRun(runId: string, message: string): AsyncIterable<AgentEvent>; // steering / reprise
  cancelRun(runId: string): Promise<void>;
  resolvePermission(runId: string, permissionId: string, decision: "allow"|"deny"): Promise<void>;
  estimate(input: StartRunInput): Promise<{ estInputTokens:number; estCostUsd:number; estSeconds:number }>;
}

interface StartRunInput {
  agent: AgentConfig;            // model, persona, allowedTools, mcpServers, maxTurns, permissionMode
  mission: { id:string; prompt:string };
  workspace: { ref:string; branch:string };
  sandbox: Sandbox;             // déjà provisionné
  credentials: ResolvedCredentials;  // BYOK (déchiffrées en mémoire, jamais loggées)
  sharedContext?: string;       // injecté depuis la base de contexte projet (§6.17)
}
```

- **ClaudeEngine** : utilise `query()` du Agent SDK. Mappe : `init` → `run.ready` + capte `session_id` (= clé de reprise) ; messages assistant → `output`/`thought` ; tool use → `tool.call`/`tool.result` ; éditions fichiers → `file.changed` ; **hooks** (`PreToolUse`, `PostToolUse`, `Stop`, `SessionStart/End`, `UserPromptSubmit`, `SubagentStop`) → événements correspondants ; callback `canUseTool` → émet `permission.requested` et **attend** la décision (Promise résolue par `resolvePermission`) ; `result` final → `run.completed` (avec coût). Respecte `allowedTools`, `permissionMode`, `maxTurns`.
- **GeminiEngine** : utilise l'**Interactions API** (`interactions.create({ agent:"antigravity-…", input, environment:"remote", tools:[…], store:true })`). Stream **SSE** → traduit en `AgentEvent`. Reprise via `previous_interaction_id`. `cancel` via l'API. ⚠️ Limites *preview* à gérer (pas de `temperature`/`max_output_tokens`/structured output ; function calling stateful uniquement ; `mcp`/`computer_use` pas encore dispo) — confirme l'état actuel.

### 4.7 API (REST/RPC) — endpoints `[MVP]` sauf mention

| Méthode + route | Rôle |
|---|---|
| `…Auth.js handlers` | Connexion (Google + email). |
| `POST /api/credentials` · `GET` (masqué) · `DELETE` | BYOK chiffré par provider. |
| `GET/POST/PATCH/DELETE /api/agents` | CRUD agents. |
| `GET/POST /api/workspaces` | Connexion repo / liste. |
| `GET/POST/PATCH /api/missions` | CRUD missions. |
| `POST /api/missions/:id/assign` `{agentId}` | Assignation. |
| `POST /api/missions/:id/estimate` | Pré-vol coût/durée. |
| `POST /api/missions/:id/start` | Crée un **run**, provisionne sandbox, lance l'Engine. |
| `POST /api/runs/:id/cancel` | Annule. |
| `POST /api/runs/:id/message` `{text}` | Steering / reprise. |
| `POST /api/runs/:id/permissions/:pid` `{decision}` | Approuve une permission. |
| `GET /api/runs/:id/events?after=seq` | Historique paginé (replay). |
| `POST /api/approvals/:id` `{decision}` | Approuve/rejette un artifact. |
| `POST /api/control/stop-all` | **Kill switch** global. |
| `POST /api/snapshots/:id/restore` `[v2]` | Rollback workspace. |
| `GET /api/analytics?range=` `[v2]` | Métriques de productivité. |
| `GET/PATCH /api/notifications` | Liste / marquer lu. |
| `POST /api/webhooks/github` `[v2]` | Déclencheurs (PR ouverte → réveil agent). |

Toutes les entrées validées par **Zod**. Toutes les routes scoping par `userId` (isolation tenant).

---

## 5. Modèle de données (Prisma — champs & enums figés)

```prisma
model User { id String @id; email String @unique; name String?; image String?; createdAt DateTime @default(now())
  agents Agent[]; workspaces Workspace[]; missions Mission[]; credentials Credential[] }

model Credential { id String @id; userId String; provider Provider; // ANTHROPIC | GEMINI
  ciphertext String;  // clé chiffrée (KMS). JAMAIS en clair.
  label String?; createdAt DateTime @default(now()); @@unique([userId, provider]) }

model Agent { id String @id; userId String; name String; avatarSeed String;
  klass AgentClass;            // FRONTEND | BACKEND | TESTS | RESEARCH | DEVOPS | DOCS | REFACTOR | GENERALIST
  engine Engine;               // CLAUDE | GEMINI
  model String;                // ex. "claude-sonnet-4-6", "gemini-3.5-flash"
  persona String;              // instructions système
  traitId String?;             // preset comportemental (§6.4)
  permissionMode PermissionMode; // ASK | AUTO  (ASK = demande avant action sensible)
  allowedTools String[];       // liste blanche
  mcpServerIds String[];       // compétences attachées (§ magasin MCP)
  maxTurns Int @default(40);
  budgetCapUsd Decimal?;       // plafond par période ; null = pas de plafond
  createdAt DateTime @default(now()); runs Run[] }

model Workspace { id String @id; userId String; name String; repoUrl String?; defaultBranch String @default("main") }

model Mission { id String @id; userId String; title String; prompt String;
  workspaceId String; agentId String?;
  priority Priority @default(NORMAL);    // LOW | NORMAL | HIGH | URGENT
  status MissionStatus;                  // BACKLOG | QUEUED | RUNNING | NEEDS_REVIEW | DONE | FAILED | CANCELLED
  recipeId String?; createdAt DateTime @default(now()); runs Run[] }

model Run { id String @id; missionId String; agentId String; userId String;
  engineSessionId String?;     // session_id (Claude) / interaction_id (Gemini)
  sandboxId String?; initialSnapshotRef String?;
  state RunState;              // PROVISIONING | READY | RUNNING | BLOCKED | COMPLETED | FAILED | CANCELLED
  blockedReason String?; startedAt DateTime?; endedAt DateTime?;
  inputTokens Int @default(0); outputTokens Int @default(0); costUsd Decimal @default(0);
  events Event[]; artifacts Artifact[] }

model Event { id String @id; runId String; agentId String; seq Int; ts DateTime; type String; payload Json; @@index([runId, seq]) }

model Artifact { id String @id; runId String; type ArtifactType; // DIFF | PLAN | SCREENSHOT | REPORT
  ref String; // pointeur object storage ou diff inline
  status ApprovalStatus @default(PENDING); // PENDING | APPROVED | REJECTED
  createdAt DateTime @default(now()) }

model Notification { id String @id; userId String; kind NotifKind; // PERMISSION | COMPLETED | FAILED | BUDGET | BLOCKED
  agentId String?; runId String?; message String; read Boolean @default(false); createdAt DateTime @default(now()) }

model Snapshot { id String @id; runId String; ref String; createdAt DateTime @default(now()) } // [v2]
model Recipe { id String @id; userId String; title String; template String; variables Json } // [v2]
model Team { id String @id; userId String; name String; agentIds String[]; pipeline Json? } // [v2]
```
Les **Vitals** ne sont **pas** stockées : elles se **calculent** (§7) depuis Run/Event/Credential et sont diffusées via WS.

---

## 6. Spécification fonctionnalité par fonctionnalité

> Format de chaque section : **Objectif · Layout · Données · Interactions · États & cas limites · Critères d'acceptation.**

### 6.1 Authentification & onboarding (BYOK) `[MVP]`
- **Objectif** : me connecter et enregistrer mes clés en sécurité.
- **Layout** : page connexion (boutons « Continuer avec Google », « par email »). Après login : **wizard onboarding** en 3 étapes — (1) ajouter clé Anthropic, (2) ajouter clé Gemini, (3) connecter un workspace.
- **Données** : email, providers configurés (état masqué `sk-…••••1234`).
- **Interactions** : coller une clé → bouton « Tester la clé » (ping léger) → enregistrer (chiffrée). Sauter une étape possible (mais on signale les capacités indisponibles).
- **États** : clé invalide → message clair sans révéler la clé ; aucune clé → les actions de lancement sont désactivées avec tooltip « Ajoute ta clé {provider} ».
- **Critères d'acceptation** :
  - [ ] Connexion Google + email fonctionnelle.
  - [ ] Clé enregistrée **chiffrée** (vérifier en base : pas de clair) et jamais renvoyée en clair au client.
  - [ ] « Tester la clé » distingue clé valide / invalide.

### 6.2 Le Monde (vue principale / roster) `[MVP]`
- **Objectif** : voir tout mon foyer d'agents et leur état d'un coup d'œil.
- **Layout** :
  - **Scène** centrale stylisée (bureau/foyer) : grille CSS avec un **avatar par agent**, surmonté de son **plumbob** et de **mini-barres Vitals**. (Démarrer en grille positionnée ; PixiJS isométrique `[v2]`.)
  - **Bandeau supérieur « Qui a besoin de moi ? »** : remonte d'abord les agents 🔴/🟡 (permission en attente, bloqués, budget bas). Vide → message « Tout roule ✨ ».
  - **Barre d'état globale** : coût du jour, nombre de runs actifs, missions en attente de revue.
  - **Bascule Mode Construction / Mode Vie** (§6.4/§6.5) et bouton **⌘K** (§6.13).
- **Données par agent** : nom, classe, plumbob, Vitals miniatures, action en cours (1 ligne), modèle.
- **Interactions** : clic agent → ouvre sa **fiche** (§6.3) ; glisser une **mission** depuis le task board sur un agent → assignation ; menu contextuel (pause/reprise/cooldown/dupliquer/parler).
- **États** : agent inactif (idle, animation « regarde autour ») ; agent qui dort (rate-limité/budget épuisé, grisé + Zzz) ; agent qui travaille (animation frappe + bulle de pensée live) ; aucun agent → état vide avec CTA « Crée ton premier agent ».
- **Critères d'acceptation** :
  - [ ] Le plumbob et les Vitals se mettent à jour **en temps réel** (WS) sans rechargement.
  - [ ] Les agents nécessitant une action remontent en tête du bandeau.
  - [ ] Le drag d'une mission sur un agent l'assigne (et persiste).

### 6.3 Fiche agent (drawer détaillé) `[MVP]`
- **Objectif** : tout savoir/piloter d'un agent et suivre son run en direct.
- **Layout** : panneau latéral à 4 zones — (A) **en-tête** (avatar, nom, classe, modèle, plumbob, boutons d'action) ; (B) **Vitals** (4 barres + explication au survol : « Énergie = budget restant ») ; (C) **Run en cours** : plan (étapes cochées), **bulle de pensée**, **journal d'activité live** (liste d'`AgentEvent` lisibles : appels d'outils, fichiers modifiés) ; (D) **historique** des runs passés.
- **Données** : config agent, Vitals, événements du run actif (stream), coût en direct.
- **Interactions** : **Pause / Reprendre / Annuler** ; **Parler** (champ de message → `POST /runs/:id/message`, steering sans relancer) ; **Promouvoir** (changer le modèle, ex. Sonnet→Opus) ; **Cooldown** (« envoyer se reposer ») ; **Dupliquer**.
- **États** : pas de run actif → afficher « Au repos » + bouton « Donner une mission » ; run bloqué → bannière (raison) + action (approuver/relancer) ; erreur → message + bouton réessayer.
- **Critères d'acceptation** :
  - [ ] Le journal affiche les événements **dans l'ordre** (`seq`) et en direct.
  - [ ] « Parler » influence le run en cours sans le redémarrer.
  - [ ] « Promouvoir » change le modèle utilisé au prochain run (et l'indique).

### 6.4 Mode Construction — création/édition d'agent `[MVP]`
- **Objectif** : configurer un agent précisément.
- **Layout** : formulaire en sections — **Identité** (nom, avatar généré depuis `avatarSeed`, classe) ; **Cerveau** (engine + modèle) ; **Personnalité** (sélection d'un **Trait** = preset, voir plus bas) ; **Persona** (instructions système, éditable) ; **Compétences** (MCP attachés via le magasin) ; **Permissions** (`ASK`/`AUTO`, liste blanche d'outils, `maxTurns`) ; **Budget** (plafond par période).
- **Traits (presets comportementaux)** — *la personnalité EST la configuration* :
  | Trait | Effet concret |
  |---|---|
  | Prudent | `permissionMode=ASK`, outils restreints, persona « écris des tests, vérifie avant d'agir ». |
  | Rapide | modèle Flash/Haiku, `permissionMode=AUTO`, `maxTurns` bas. |
  | Économe | privilégie le modèle le moins cher, plafond budget serré. |
  | Perfectionniste | persona « relis et refactore », ajoute une étape de revue, modèle fort. |
  Choisir un trait **préremplit** les champs (modifiables ensuite).
- **Interactions** : aperçu live de l'avatar ; « Tester » (lancer une micro-mission dans un sandbox jetable `[v2]`) ; enregistrer.
- **États** : validation (nom requis, modèle requis, clé du provider présente sinon avertir).
- **Critères d'acceptation** :
  - [ ] Choisir un trait modifie réellement modèle + permissions + persona.
  - [ ] Un agent sans clé provider valide ne peut pas être lancé (message clair).

### 6.5 Mode Vie `[MVP]`
- **Objectif** : observer/intervenir en temps réel.
- **Layout** : la Scène en pleines couleurs + animations ; clic = fiche agent ; le task board accessible en panneau latéral.
- **Différence avec Construction** : Construction = grille visible, édition ; Vie = lecture + intervention + animations.
- **Critères d'acceptation** :
  - [ ] Basculer Construction↔Vie ne perd pas l'état (agents/missions).

### 6.6 Tableau des missions (task board + inbox) `[MVP]`
- **Objectif** : organiser et distribuer le travail.
- **Layout** : colonnes par statut (**Backlog · En file · En cours · À réviser · Fait**), cartes déplaçables (dnd-kit). Une **inbox** en haut pour saisir vite une tâche (routing auto `[v2]`).
- **Données par carte** : titre, agent assigné (avatar), priorité, workspace, coût consommé, badge « artefact à réviser ».
- **Interactions** : créer une mission ; **glisser une carte sur un agent** (dans Le Monde) = assigner ; changer priorité ; ouvrir (§6.7).
- **États** : colonne vide ; mission en échec (carte rouge + action réessayer).
- **Critères d'acceptation** :
  - [ ] Le statut reflète le `RunState` en temps réel.
  - [ ] Le drag persiste l'assignation et la priorité.

### 6.7 Création & assignation d'une mission + **pré-vol** `[MVP]`
- **Objectif** : lancer une mission en connaissant son coût.
- **Layout** : modale — titre, **prompt** (multi-ligne), workspace cible (+ branche), agent (ou « auto » `[v2]`), priorité. Bouton **« Estimer »** → encart « **~0,40 $ · ~3 min · ~12k tokens** ». Bouton **« Lancer »**.
- **Interactions** : « Estimer » appelle `POST /missions/:id/estimate` (via `engine.estimate`) ; « Lancer » crée le run.
- **États** : estimation indisponible → afficher fourchette + avertissement ; budget agent dépassé par l'estimation → demander confirmation.
- **Critères d'acceptation** :
  - [ ] L'estimation s'affiche **avant** lancement.
  - [ ] Lancer crée un `Run` en `PROVISIONING` et un sandbox.

### 6.8 Flux d'activité temps réel (timeline) `[MVP]`
- **Objectif** : voir l'activité de **tous** les agents au même endroit.
- **Layout** : fil chronologique inversé d'`AgentEvent` agrégés (avatar + type lisible + résumé court + horodatage). Filtres : par agent, par type, « seulement ce qui demande une action ».
- **Interactions** : clic sur un événement → ouvre le run/la fiche au bon endroit ; **replay** d'un run (rejouer `seq` par `seq`) `[v2]`.
- **Critères d'acceptation** :
  - [ ] Nouveaux événements apparaissent en direct (WS).
  - [ ] Le filtre « action requise » n'affiche que permissions/erreurs/blocages.

### 6.9 Revue d'artefacts / diffs / approbations + **batch review** `[MVP]`
- **Objectif** : réviser vite ce que produisent les agents.
- **Layout** : **file de revue** (tous les `Artifact` en `PENDING`). Pour un diff : **viewer de diff** (coloration syntaxique, +/-), résumé « ce que j'ai fait + pourquoi », fichiers touchés. Pour un plan/rapport : rendu Markdown. Pour une capture : image.
- **Interactions** : **Approuver** / **Rejeter** / **Demander une reprise** (renvoie un message à l'agent). **Mode batch** : naviguer la file au clavier (`j/k`), `a` = approuver, `r` = rejeter — indispensable quand plusieurs agents finissent ensemble. À l'approbation d'un diff lié à un repo → **ouvrir/mettre à jour une PR** `[v2]`.
- **États** : file vide ; conflit/diff périmé → invalidation + relancer.
- **Critères d'acceptation** :
  - [ ] Un run terminé qui produit un diff crée un `Artifact` `PENDING` visible ici.
  - [ ] Raccourcis clavier `a`/`r`/`j`/`k` fonctionnels.

### 6.10 Budgets & coûts (l'« Énergie ») `[MVP]`
- **Objectif** : maîtriser la dépense en continu.
- **Layout** : widget coût (jour / période) global + par agent ; barre d'**Énergie** = budget restant ; historique de coût par mission/modèle (graphe) `[v2]`.
- **Interactions** : définir un **plafond** par agent et global ; à l'épuisement → l'agent **s'endort** (pause auto) au lieu de continuer ; alerte visuelle au rouge.
- **Critères d'acceptation** :
  - [ ] Le coût d'un run s'incrémente en direct via les events `cost.update`.
  - [ ] Atteindre le plafond met l'agent en pause (et notifie).

### 6.11 Notifications & demandes de permission `[MVP]`
- **Objectif** : être sollicité uniquement quand c'est utile, et décider vite.
- **Layout** : cloche + centre de notifications ; une **demande de permission** affiche l'action exacte, le **risque** (low/medium/high) et le détail (ex. commande shell exacte).
- **Interactions** : **Autoriser** / **Refuser** (résout la Promise côté Engine et débloque le run) ; depuis la notif **ou** la fiche agent. Canaux : in-app `[MVP]`, **push PWA / email** `[v2]` avec **escalade** si pas de réponse `[v2]`.
- **États** : permission expirée (timeout) → le run reste bloqué, action « relancer la demande ».
- **Critères d'acceptation** :
  - [ ] En mode `ASK`, un outil sensible déclenche `permission.requested` et **bloque** le run jusqu'à décision.
  - [ ] Autoriser/Refuser débloque/arrête correctement le run.

### 6.12 Vitals & Plumbob (affichage) `[MVP]`
- Voir **§7** pour les formules. Affichage : 4 barres segmentées (style Sims) + diamant plumbob, **toujours doublé d'une icône + label** (accessibilité, jamais la couleur seule). Survol = explication chiffrée.

### 6.13 Palette de commandes ⌘K `[MVP]`
- **Objectif** : tout piloter au clavier.
- **Contenu** : « Nouvelle mission », « Aller à l'agent… », « Lancer une recette… », « Pause de tous les agents », « Arrêt d'urgence », recherche d'agent/mission.
- **Critères d'acceptation** :
  - [ ] ⌘K ouvre la palette ; chaque commande exécute l'action correspondante.

### 6.14 Recettes de missions (templates paramétrés) `[v2]`
- **Objectif** : relancer des missions fréquentes sans retaper.
- **Layout** : bibliothèque de **Recipes** (`template` avec variables `{module}`, `{branch}`…). Lancer une recette → formulaire de variables → mission préremplie.
- **Critères d'acceptation** :
  - [ ] Créer/éditer une recette ; la lancer génère une mission avec variables substituées.

### 6.15 Snapshots & rollback `[v2]`
- **Objectif** : laisser les agents oser, sans risque.
- **Comportement** : snapshot du workspace **avant** chaque run (`initialSnapshotRef`) ; bouton **« Revenir avant ce run »** restaure l'état.
- **Critères d'acceptation** :
  - [ ] Restaurer ramène le workspace à l'état pré-run.

### 6.16 Détection & reprise d'agent bloqué `[v2]`
- **Objectif** : ne pas gaspiller de budget sur un agent coincé.
- **Comportement** : détecter `stalled` (aucun event depuis X) / `loop` (mêmes appels répétés) / coût qui s'emballe → **auto-pause** + propose : réessayer, **downgrade modèle**, ou escalade vers moi.
- **Critères d'acceptation** :
  - [ ] Un run sans progression depuis le seuil passe `BLOCKED` et notifie.

### 6.17 Base de contexte projet partagée `[v2]`
- **Objectif** : cohérence entre agents.
- **Comportement** : un espace par workspace (conventions, archi, glossaire, règles) **injecté automatiquement** dans `sharedContext` de chaque run.
- **Critères d'acceptation** :
  - [ ] Le contexte partagé est transmis à l'Engine au lancement (vérifiable dans le prompt système).

### 6.18 Analytics de productivité `[v2]`
- **Objectif** : optimiser mon usage.
- **Contenu** : missions/jour, **taux de réussite par agent/modèle**, **coût par feature/mission**, durée moyenne, et **recommandations de routing** (ex. « ces tâches simples tournent sur Opus → Flash suffirait »).
- **Critères d'acceptation** :
  - [ ] Tableau de bord avec au moins : débit, réussite/modèle, coût/modèle.

### 6.19 Paramètres & garde-fous globaux `[MVP]`
- **Contenu** : **Arrêt d'urgence** (stop-all), mode global `ASK`/`AUTO` par défaut, gestion des clés (révoquer/rotation), gestion des workspaces.
- **Critères d'acceptation** :
  - [ ] « Arrêt d'urgence » annule tous les runs actifs et met les agents en pause.

### Idées additionnelles à spécifier plus tard `[v2]`
Découpage auto d'un gros objectif (agent « contremaître ») · routing auto des tâches · capture vocale/mobile · files planifiées / run de nuit · « definition of done » par mission (l'agent reboucle jusqu'aux tests verts) · connecteurs backlog (Linear/Jira/Issues) · déclencheurs (webhooks GitHub, cron) · duel de modèles A/B · standup quotidien auto · magasin de compétences MCP (« Mode Achat ») · délégation/handoff entre agents · skill tree/XP · partage de foyer entre collègues. (Chacune suivra le même format Objectif/Layout/Interactions/Critères quand on l'attaquera.)

---

## 7. Calcul des Vitals & du Plumbob (formules précises)

Toutes sur **0–100**. Recalculées à chaque `cost.update`/`run.*` et diffusées en `VitalsSnapshot`.

- **⚡ Énergie** = `100 × (budgetRestantPériode / budgetAlloué)`. Si pas de plafond → proxy sur la marge de rate-limit du provider (ou 100). **Seuils couleur** : `>40` vert · `15–40` jaune · `<15` rouge → l'agent **dort**.
- **🍔 Motivation** (« faim » de travail) = `runActif ? 100 : (missionsEnFile>0 ? 60 : 10)`. Bas = « affamé » → me suggère de lui donner du travail.
- **😊 Humeur** = taux de réussite sur les `N=10` derniers runs : `100 × done/(done+failed)` ; aucun historique → `70` (neutre).
- **🧠 Clarté** = `100 × (1 − tokensContexteUtilisés / fenêtreContexte)`. Bas = « fatigué/encombré » → suggérer `/compact` ou repartir d'une session fraîche.
- **🔆 Plumbob** (agrégat, par **priorité décroissante**) :
  1. **🔴 rouge** si : `Énergie<15` **ou** `run.failed` non résolu **ou** `run.blocked` **ou** permission en attente depuis > seuil.
  2. **🟡 jaune** si : permission en attente (récente) **ou** `Énergie<40` **ou** `Humeur<50`.
  3. **🟢 vert** sinon.

---

## 8. Direction artistique (précise)

> 🎨 Un **document de design dédié** (identité visuelle, design system complet, écrans à maquetter) existe en complément : **`design-brief-agentsims-claude-design.md`**, à coller dans **Claude Design** pour générer les maquettes. Cette §8 en est le résumé orienté implémentation.

- **Ton** : « compétence mignonne » — vivant et chaleureux mais pro et lisible. Pas enfantin.
- **Layout global** : barre latérale gauche (navigation : Le Monde, Missions, Revue, Timeline, Analytics, Paramètres) ; zone centrale = écran courant ; barre supérieure = coût du jour + runs actifs + cloche + bascule Construction/Vie + ⌘K.
- **Tokens visuels** : palette chaude focalisée (1 couleur d'accent + neutres), rayons généreux (`rounded-xl/2xl`), ombres douces, densité confortable. Définir les tokens dans Tailwind (couleurs sémantiques : `success/warn/danger` pour le plumbob, **doublés d'icônes**).
- **Composants à réutiliser (shadcn)** : `Card`, `Drawer/Sheet` (fiche agent), `Dialog` (mission), `Command` (⌘K), `Badge`, `Progress` (Vitals segmentées custom), `Tabs`, `Tooltip`, `Toast` (notifications).
- **Motion (framer-motion)** : transitions douces (200–300ms) ; **micro-animations d'inactivité** par état (idle = « respire/regarde », working = « tape » + bulle, sleeping = Zzz grisé) ; respecter `prefers-reduced-motion` (désactiver les boucles).
- **Bulle de pensée** : petit cartouche au-dessus de l'avatar affichant le dernier `thought`/`tool.call` lisible.
- **Accessibilité** : navigation clavier complète, focus visibles, contrastes AA, états plumbob = icône + label (pas la couleur seule), alternatives textuelles.
- **États vides soignés** (chaque écran) avec un CTA clair.
- Suis le SKILL **frontend-design** du repo si présent ; sinon, applique : hiérarchie typographique nette, espacement généreux, un seul accent.

---

## 9. Sécurité & garde-fous (précis)

- **Isolation tenant** : toutes les requêtes scoping `userId` ; un sandbox **éphémère par run**, détruit à la fin ; **aucun** code utilisateur sur l'hôte ; egress réseau filtré.
- **Secrets** : chiffrés au repos (KMS/secret manager) ; **BYOK** par utilisateur ; jamais loggés ni renvoyés en clair ; rotation/révocation depuis les paramètres.
- **Permissions agent** : `ASK` par défaut → toute action sensible (`shell`, écriture hors workspace, réseau) passe par `permission.requested` (fail-closed : pas de réponse = pas d'exécution). `maxTurns` plafonné. Liste blanche d'outils par agent.
- **Coûts** : plafonds par agent + global ; auto-pause à l'épuisement ; détection de boucle → auto-pause `[v2]`.
- **Arrêt d'urgence** global + annulation par run.
- **Audit** : journaliser approbations/refus et actions sensibles (sans secrets).
- *Note coût (à vérifier au moment du build)* : la facturation séparée prévue le 15/06/2026 pour l'usage SDK/headless de Claude a été **mise en pause** ce jour-là — l'usage via abonnement reste couvert pour l'instant. Confirme l'état actuel ; conçois le suivi de coût quoi qu'il arrive.

---

## 10. Plan de jalons (périmètre + DoD testable)

- **Jalon 0 — Squelette** : Next.js + Auth.js (Google+email) + Prisma/Postgres + Redis + un WS qui pousse un event factice rendu dans l'UI.
  - DoD : `- [ ]` je me connecte ; `- [ ]` un event factice s'affiche en direct.
- **Jalon 1 — Un agent Claude vivant** : §6.1 (BYOK) + §6.3 (fiche) + §6.7 (lancement+pré-vol) + `ClaudeEngine` + sandbox basique + §6.10 (coût live) + §6.11 (permissions).
  - DoD : `- [ ]` créer un agent Claude, lancer une mission, voir étapes/pensées/fichiers **en direct**, approuver une permission, voir le **coût**, recevoir un **diff** à approuver — exécution confinée au sandbox, aucun secret en clair.
- **Jalon 2 — Le Monde des Sims** : §6.2 + §6.4 (traits) + §6.5 + §6.6 (task board) + §6.8 (timeline) + §6.9 (revue + batch) + §7 (Vitals/plumbob) + §6.13 (⌘K).
  - DoD : `- [ ]` la Scène montre les agents avec Vitals/plumbob temps réel ; `- [ ]` drag mission→agent ; `- [ ]` batch review au clavier.
- **Jalon 3 — Moteur Gemini/Antigravity** : `GeminiEngine` (Interactions API) + `SandboxProvider` managé + un agent Claude et un agent Gemini **en parallèle**.
  - DoD : `- [ ]` deux agents de moteurs différents tournent en même temps dans Le Monde.
- **Jalon 4 — Productivité** : recettes, snapshots/rollback, détection blocage, contexte partagé, connecteurs backlog, déclencheurs, duel A/B, analytics, standup, magasin MCP (selon mes priorités).
- **Jalon 5 — Polish** : animations, a11y complète, notifications push/PWA, états vides, perfs.

---

## 11. Décisions actées & questions ouvertes

**Actées** : hébergée (multi-tenant) · BYOK · deux moteurs via adapter commun · Gemini via Interactions API par défaut · stack §4.2.

**À me confirmer avant le Jalon 3 :**
1. **Fournisseur de sandbox** (E2B / Daytona / Modal / Fly Machines / Firecracker maison) — ta reco la plus simple pour démarrer.
2. **Cible de déploiement** (Fly.io / Railway / Render / cloud).
3. Parmi les idées `[v2]` (§6.14→§6.19 + liste additionnelle), **lesquelles passer en exigences fermes** et à quel jalon.
4. Tout point que tu juges bloquant ou sur-dimensionné pour un V1.

---

# COMPLÉMENTS TECHNIQUES (dossier complété)

## 12. Exigences non-fonctionnelles (SLO)
- **Latence du flux d'événements** : < 500 ms entre l'action de l'agent et son affichage (p95).
- **Agents concurrents** : 2 (Free) · 5 (Pro) · 10+/siège (Team) — plafonné par palier.
- **Disponibilité** : cible 99.5 % (V1) ; SLA contractuel réservé à l'Entreprise.
- **Navigateurs** : 2 dernières versions de Chrome/Edge/Safari/Firefox ; desktop-first, mobile = vue focalisée.
- **Cold start sandbox** : cible < 10 s ; au-delà, afficher l'état `PROVISIONING`.

## 13. Résilience & gestion d'erreurs (politique système)
- **WebSocket** : reconnexion auto (backoff + jitter) ; à la reconnexion, le client **rejoue** via `GET /runs/:id/events?after=lastSeq` → aucune perte d'événement.
- **Crash run / mort du sandbox** : marquer `FAILED (recoverable)`, libérer le sandbox, proposer une reprise depuis le dernier checkpoint.
- **Rate-limit fournisseur** : backoff exponentiel ; si épuisé, l'agent passe « dort » + notification.
- **Idempotence** : `start` idempotent (clé missionId + token) pour éviter les doublons de run.
- **Persistance avant diffusion** (déjà §4.4) → tout est rejouable.
- **Dead-letter queue** pour les jobs échoués + alerte. **Timeouts** par run et par appel d'outil.

## 14. Intégrations (spec)
### 14.1 Git / GitHub
- Auth via **GitHub App** (permissions fines, tokens courts ; fallback OAuth).
- Clone du repo dans le sandbox à la branche cible ; chaque mission = branche `agentsims/<missionId>`.
- Diff approuvé → commit + push + **ouverture de PR** via l'API GitHub (titre = mission, corps = résumé de l'agent). Lien PR stocké sur l'`Artifact`.
- Repos privés supportés via l'installation de la GitHub App.
### 14.2 Stripe (facturation)
- Produits/prix = les paliers (voir doc monétisation). **Checkout** + **Customer Portal**.
- Webhooks Stripe → mise à jour du plan en base ; **gating** des features/quotas via un middleware `requirePlan`.
- Métrage d'usage (agents concurrents, runs/mois) via compteurs Redis.
### 14.3 Fournisseur de sandbox — **DÉCISION : E2B**
- Raison : SDK orienté agents/code, microVM Firecracker isolés, démarrage rapide, exec/fichiers/ports. *(Vérifier l'API à jour.)* Alternatives Daytona / Modal / Fly Machines gardées derrière l'interface `SandboxProvider`.
- Limites de ressources par palier ; **egress filtré** (allowlist de registries/paquets) ; destruction en fin de run.
### 14.4 Secrets / KMS (concret)
- **Chiffrement enveloppe** : data key chiffrée par une master key dans un KMS (AWS KMS / GCP KMS / Vault/Infisical).
- Déchiffrement **uniquement en mémoire** du worker au lancement du run ; **jamais loggé** ; effacé après usage.
- Rotation de la master key supportée ; accès audités.

## 15. Tests & CI/CD
- **Unitaires** (Vitest) : logique métier (vitals, coûts, adapters de moteur mockés).
- **Intégration** : moteurs contre des mocks de SDK/API ; `SandboxProvider` en mode fake.
- **E2E** (Playwright) : le golden path (§3) + écrans clés (onboarding, lancement, approbation, batch review).
- **CI** (GitHub Actions) : lint + typecheck + tests à chaque PR ; preview deploy.
- **Environnements** : dev / staging / prod ; **seed/demo data** (un foyer d'exemple à 3 agents) pour les démos.

## 16. Observabilité de la plateforme
- Logs structurés (pino) corrélés par `runId`.
- Erreurs : **Sentry** (front + back).
- Métriques : latence des events, durée de run, coût, taux d'échec, sandboxes actifs (Prometheus/Grafana ou hébergé).
- Tracing optionnel (OpenTelemetry) orchestrateur → moteur → sandbox.

## 17. Multi-tenant, sécurité des données & rétention
- Isolation : **Postgres RLS** (policies par `userId`/`orgId`) + garde applicative ; aucune requête cross-tenant.
- Sessions : durée + refresh ; CSRF ; rate-limiting par user (Redis).
- **Rétention** : events/logs 90 j par défaut (configurable), artefacts selon le plan ; suppression de compte = purge (**RGPD**, droit à l'effacement) ; export des données.
- Niveau organisation (Team/Entreprise) : champ `orgId` + RBAC (voir doc monétisation).

## 18. Config des coûts (source de vérité)
- Table `modelPricing` versionnée (par modèle : prix input/output par M tokens, devise), mise à jour depuis la doc fournisseur.
- Coût d'un run = somme des usages (events `cost.update`) × prix ; arrondi ; devise selon l'utilisateur.
- Afficher **coût estimé** (pré-vol) vs **coût réel**.

## 19. Internationalisation
- i18n **FR + EN** dès le départ (next-intl ou équivalent) ; FR par défaut, EN pour le marché. Toutes les chaînes externalisées.

## 20. Pont design → code
- Tokens finaux fournis dans **`design-tokens-agentsims.css`** + extrait de config Tailwind → **source unique**, ne hardcode aucune valeur.
- Composants : shadcn/ui stylés avec ces tokens ; les motifs Sims (plumbob, barres de vitals, bulle de pensée) = composants custom documentés.

## 21. Décisions désormais ACTÉES (mise à jour de §11)
- **Sandbox** : **E2B** (abstraction conservée).
- **Déploiement** : front Next.js sur **Vercel** ; orchestrateur + workers + WebSocket sur **Fly.io** (régions proches des users) ; **Postgres + Redis managés** (Neon / Upstash ou Fly).
- **i18n** : FR + EN.
- **Périmètre V1 ferme** (promu depuis `[v2]`) : Git/PR · magasin MCP (basique) · recettes · snapshots/rollback · détection d'agent bloqué · contexte projet partagé · analytics basiques.
- **Hors V1** : marketplace payant, white-label, on-prem, duels A/B avancés, capture vocale, agents always-on planifiés.

---

# 22. Fonctionnalités complémentaires (revue & clarifications)

> Surfaces manquantes ou sous-spécifiées, ajoutées au format exécutable : **Objectif · Écran & interactions · Critères d'acceptation** (`- [ ]` = testable). Tags `[MVP]` `[v2]` `[Team]` `[Entreprise]`. Certaines **précisent** une section existante.

## A. Activation & usage quotidien

### 22.1 Onboarding guidé & première mission `[MVP]`
- **Objectif** : amener un nouvel utilisateur à son premier run **approuvé** (le « aha ») sans friction. *(Complète §6.1, qui ne couvre que le BYOK.)*
- **Écran & interactions** : après le BYOK, une **check-list d'activation** (clé ajoutée → workspace connecté → première mission) + un bouton « Lancer une mission d'exemple » qui utilise le foyer de démo et un workspace bac-à-sable préconfiguré. Barre de progression, dismissable une fois complétée.
- **Critères** : `- [ ]` un nouvel utilisateur peut atteindre un premier run terminé+approuvé via le flux guidé ; `- [ ]` la check-list reflète l'état réel (étapes cochées automatiquement).

### 22.2 Conversation avec un agent (chat & steering) `[MVP]`
- **Objectif** : dialoguer avec un agent et le réorienter sans relancer. *(Étend le « Parler » de §6.3.)*
- **Écran & interactions** : un onglet **Chat** dans la fiche agent, distinct du journal d'événements : historique des messages (mes interjections + réponses/raisonnements de l'agent), zone de saisie qui envoie via `POST /runs/:id/message`. Depuis le chat je peux aussi lancer une mission rapide.
- **Critères** : `- [ ]` les messages s'affichent dans l'ordre et en direct ; `- [ ]` un message envoyé pendant un run l'influence sans le redémarrer.

### 22.3 Recherche globale `[MVP]`
- **Objectif** : retrouver vite n'importe quoi. *(Complète ⌘K §6.13.)*
- **Écran & interactions** : recherche (depuis ⌘K et une page dédiée) sur **agents, missions, runs, artefacts** par texte ; filtres par type/statut/agent ; clic = navigation vers l'entité.
- **Critères** : `- [ ]` une requête renvoie les entités correspondantes ; `- [ ]` le résultat ouvre le bon écran.

### 22.4 File d'attente & concurrence visibles `[MVP]`
- **Objectif** : rendre lisible la limite d'agents concurrents du palier.
- **Écran & interactions** : quand la limite est atteinte, les missions suivantes affichent **« En file · position X »** et la raison ; un indicateur global montre N runs actifs / quota. Reprise auto quand un créneau se libère.
- **Critères** : `- [ ]` à la limite, une nouvelle mission passe en file avec sa position ; `- [ ]` elle démarre automatiquement quand un créneau se libère.

### 22.5 Actions sur artefacts `[MVP]`
- **Objectif** : exploiter un livrable au-delà d'approuver/rejeter. *(Étend §6.9.)*
- **Écran & interactions** : sur un artefact — **Télécharger** (diff/fichier), **Copier**, **Ouvrir dans l'éditeur** (lien VS Code/GitHub), **Commenter** `[Team]`. Approuver/Rejeter/Reprise restent.
- **Critères** : `- [ ]` télécharger, copier et ouvrir fonctionnent sur un diff.

### 22.6 Statut système & états dégradés `[MVP]` (page publique `[v2]`)
- **Objectif** : réagir proprement aux pannes fournisseurs/maintenance. *(Pendant UI de la résilience §13.)*
- **Écran & interactions** : bannière globale en cas de panne d'un fournisseur (Anthropic/Gemini/sandbox) ou de maintenance ; les agents concernés passent **« indisponible »** au lieu d'échouer en boucle ; lien vers une page de statut `[v2]`.
- **Critères** : `- [ ]` une panne simulée d'un fournisseur affiche la bannière et met en pause les agents concernés.

### 22.7 Sélecteurs thème & langue `[MVP]`
- **Objectif** : clair/sombre + FR/EN. *(Concrétise §19 et le thème sombre du design.)*
- **Écran & interactions** : bascule thème (persistée par utilisateur, respecte le système par défaut) et langue (FR/EN), depuis le header et les Paramètres.
- **Critères** : `- [ ]` le thème persiste après rechargement ; `- [ ]` changer la langue traduit toute l'UI.

## B. Compte & configuration

### 22.8 Espace Paramètres `[MVP]`
- **Objectif** : centraliser la configuration du compte. *(Distinct des garde-fous globaux §6.19.)*
- **Écran & interactions** : navigation à sections — **Profil** (nom, avatar, langue, thème) · **Clés API** (BYOK : ajouter/tester/supprimer, masquées) · **Workspaces** (→ §22.10) · **Notifications** (→ §22.11) · **Facturation** (→ §22.9) · **Sécurité** (sessions actives, déconnexion globale) · **Zone de danger** (suppression de compte → purge RGPD).
- **Critères** : `- [ ]` chaque section est gérable ; `- [ ]` la suppression de compte purge réellement les données (events, logs, clés).

### 22.9 Facturation & abonnement (UI) `[MVP]`
- **Objectif** : voir et changer son plan. *(Pendant UI de Stripe §14.2.)*
- **Écran & interactions** : page **Plan** — palier actuel, **usage vs quota** (agents concurrents, runs/mois) en barres, **Upgrade/Downgrade** (→ Stripe Checkout/Portal), **historique de factures** (depuis Stripe).
- **Critères** : `- [ ]` le plan et l'usage s'affichent ; `- [ ]` Upgrade ouvre Stripe ; `- [ ]` dépasser le quota est empêché côté serveur et signalé dans l'UI.

### 22.10 Gestion des workspaces & contexte projet `[MVP]`
- **Objectif** : connecter des repos et donner un contexte commun aux agents. *(Précise §6.17.)*
- **Écran & interactions** : connecter un repo (**GitHub App**), lister/retirer des workspaces ; par workspace, un **éditeur de contexte partagé** (markdown : conventions, archi, glossaire, règles) injecté dans le `sharedContext` de chaque run.
- **Critères** : `- [ ]` connecter un repo privé fonctionne ; `- [ ]` le contexte édité est bien injecté au lancement (vérifiable dans le prompt système).

### 22.11 Préférences de notification & canaux `[MVP]` (push/email `[v2]`)
- **Objectif** : n'être sollicité que pour ce qui compte. *(Précise §6.11.)*
- **Écran & interactions** : choisir **quoi** notifier (permission, fin, échec, budget, blocage) et **par quel canal** (in-app `[MVP]` ; push PWA/email `[v2]`) ; heures calmes `[v2]`.
- **Critères** : `- [ ]` les préférences sont enregistrées et respectées (une catégorie désactivée ne notifie plus).

### 22.12 Clés API de la plateforme `[Pro+]`
- **Objectif** : utiliser l'API de Roost depuis l'extérieur. *(Pendant UI de l'API plateforme.)*
- **Écran & interactions** : générer/révoquer des tokens (masqués), avec **scopes** ; liste avec dernière utilisation.
- **Critères** : `- [ ]` générer puis révoquer un token ; `- [ ]` un token révoqué n'autorise plus l'accès.

## C. Capitalisation & extension

### 22.13 Magasin de compétences (MCP) — flux d'installation `[MVP basique]`
- **Objectif** : attacher des connecteurs aux agents. *(Concrétise le « magasin » de §6.4.)*
- **Écran & interactions** : catalogue de connecteurs MCP (GitHub, Linear, Slack, Postgres, navigateur…) ; **Attacher à l'agent** → auth du connecteur → gérer (activer/désactiver/retirer) par agent.
- **Critères** : `- [ ]` parcourir le catalogue ; `- [ ]` attacher un MCP à un agent le rend disponible à cet agent uniquement.

### 22.14 Recettes de missions (UI) `[v2]`
- **Objectif** : relancer des missions fréquentes. *(Précise §6.14.)*
- **Écran & interactions** : bibliothèque ; créer/éditer (`template` + variables `{module}`) ; lancer → formulaire de variables → mission préremplie.
- **Critères** : `- [ ]` créer une recette puis la lancer génère une mission avec variables substituées.

### 22.15 Historique des runs, replay & export `[MVP]` (replay scrubbable `[v2]`)
- **Objectif** : revoir et debugger le passé. *(Étend §6.8 et §6.15.)*
- **Écran & interactions** : par mission/agent, la **liste des runs passés** (statut, coût, durée, artefacts) ; ouvrir un run = voir ses événements ; **export** d'un run (JSON/markdown) ; **replay** étape par étape `[v2]`.
- **Critères** : `- [ ]` l'historique liste les runs ; `- [ ]` ouvrir un run affiche ses événements ; `- [ ]` l'export produit un fichier.

## D. Équipe `[Team / Entreprise]`

### 22.16 Équipe & collaboration (UI) `[Team]`
- **Objectif** : travailler à plusieurs dans un studio partagé.
- **Écran & interactions** : inviter des membres (email), attribuer des **rôles** (admin/membre/observateur), **studio partagé** (voir les agents/runs des autres), présence, commentaires sur artefacts.
- **Critères** : `- [ ]` inviter un membre et lui donner un rôle ; `- [ ]` un observateur ne peut pas lancer/dépenser ; `- [ ]` les membres voient les runs partagés.

### 22.17 Journal d'audit (UI) `[Team/Entreprise]`
- **Objectif** : tracer qui a fait quoi. *(Pendant UI de l'audit §17.)*
- **Écran & interactions** : vue filtrable (acteur, action, date : runs, approbations, dépenses, changements de config) ; **export**.
- **Critères** : `- [ ]` les actions sensibles apparaissent ; `- [ ]` filtrer + exporter fonctionne.

## E. Mobile

### 22.18 Application mobile / PWA — périmètre fonctionnel `[MVP focalisé]`
- **Objectif** : agir en mobilité sans recréer le desktop. *(Concrétise la vue mobile du design.)*
- **Écran & interactions** : vue mobile = fil **« Qui a besoin de moi ? »**, notifications, **approbations** (permissions + artefacts), suivi d'un run en cours. **Pas** la Scène complète ni l'édition lourde (réservées au desktop). Installable (PWA) ; push `[v2]`.
- **Critères** : `- [ ]` sur mobile, je peux approuver une permission et réviser un artefact ; `- [ ]` l'app est installable en PWA.

> **Impact design** : ces écrans sont ajoutés au brief de design (`design-brief-agentsims-claude-design.md`, section « Écrans & composants additionnels ») et de nouveaux composants/tokens y sont définis.

---

# 23. Utilisateur, profil & comptes liés

> Format : **Objectif · Écran & interactions · Critères** (`- [ ]` testable). La fiche agent (§6.3) passe à **trois onglets** : **Activité** (journal d'événements) · **Chat** (§22.2) · **Aperçu** (§25).

## 23.1 Profil utilisateur `[MVP]`
- **Objectif** : gérer son identité dans Roost.
- **Écran & interactions** : nom, **avatar** (upload ou généré depuis un seed), handle unique, fuseau horaire, langue & thème (renvoi §22.7), bio optionnelle. Sauvegarde explicite.
- **Critères** : `- [ ]` modifier le profil persiste ; `- [ ]` l'avatar et le nom s'affichent partout (header, fiches, commentaires).

## 23.2 Comptes liés — connexion, comptes IA, intégrations `[MVP]`
- **Objectif** : lier plusieurs identités et services à **un seul** compte Roost.
- **Écran & interactions** : page « Comptes liés » en 3 groupes —
  1. **Méthodes de connexion** : Google · GitHub · email/mot de passe → **lier / délier** (au moins une obligatoire) ; on peut ensuite se connecter via n'importe laquelle.
  2. **Comptes IA (fournisseurs)** : Anthropic · Gemini → connecter via **OAuth si disponible**, sinon **clé API (BYOK)** ; statut *Connecté / Expiré*, reconnecter, révoquer.
  3. **Intégrations** : GitHub (repos) · Linear · Slack… → connecter/déconnecter (OAuth), statut.
- **Critères** : `- [ ]` lier puis délier une méthode de connexion (en gardant ≥ 1) ; `- [ ]` connecter un fournisseur IA via OAuth **ou** clé ; `- [ ]` révoquer un compte coupe réellement l'accès.
- **Sécurité** : tokens OAuth **chiffrés (KMS)**, refresh géré côté serveur, jamais exposés au client ni au sandbox.

## 23.3 Sauvegarde & historique des conversations (chats) `[MVP]`
- **Objectif** : retrouver et **reprendre** toutes ses conversations avec les agents.
- **Écran & interactions** : barre latérale / page **« Conversations »** — liste (titre auto-généré, agent, date, épingle), **recherche**, renommer, épingler, supprimer, **exporter**, **Reprendre**. *Reprendre* continue le fil : reprise de la **session moteur** si possible (`engineSessionId`), sinon nouveau run avec le **contexte de la conversation réinjecté**. Chaque conversation conserve ses messages + les liens vers les runs/artefacts associés.
- **Critères** : `- [ ]` une conversation est **sauvegardée automatiquement** et réapparaît après reconnexion ; `- [ ]` je peux la rouvrir, la reprendre et l'exporter ; `- [ ]` la recherche la retrouve par texte.

## 23.4 Compléments au modèle de données
```prisma
model Conversation { id String @id; userId String; agentId String; title String;
  pinned Boolean @default(false); createdAt DateTime @default(now());
  updatedAt DateTime @updatedAt; lastMessageAt DateTime?; messages Message[] }

model Message { id String @id; conversationId String; role MessageRole; // USER | AGENT | SYSTEM
  content String; runId String?; ts DateTime @default(now()); @@index([conversationId, ts]) }

model LinkedAccount { id String @id; userId String; kind LinkedKind; // IDENTITY | AI_PROVIDER | INTEGRATION
  provider String;            // google | github | anthropic | gemini | linear | slack
  externalId String?; tokenCiphertext String?; status LinkStatus; createdAt DateTime @default(now());
  @@unique([userId, provider]) }
```
*(Les clés BYOK brutes restent dans `Credential` (§5) ; `LinkedAccount` gère les identités OAuth et les intégrations. Tout est scoping `userId` + RLS.)*

---

# 24. Import de projets existants (depuis d'autres applications IA)

## 24.1 Sources & détection automatique `[MVP]`
- **Objectif** : reprendre dans Roost un projet **déjà commencé ailleurs** (Claude Code, Antigravity, Gemini, Cursor…).
- **Sources** : **dépôt Git/GitHub** (universel) · **dossier local** (zip/upload). À l'import, Roost **scanne** la config d'outils IA présente dans le projet et la **mappe** :
  | Outil source | Fichiers détectés → mappés vers |
  |---|---|
  | **Claude Code** | `CLAUDE.md`, `.claude/`, `.mcp.json` → contexte partagé + serveurs MCP + réglages |
  | **Antigravity** | config workspace, **Skills**, `AGENTS.md` / base de connaissances → contexte partagé + skills/agents suggérés |
  | **Gemini / Antigravity CLI** | `GEMINI.md` / `AGENTS.md` → contexte partagé |
  | **Cursor / générique** | `.cursorrules`, `AGENTS.md`, `README` → contexte partagé |
- **Critères** : `- [ ]` connecter un repo détecte et **liste** les fichiers de config présents avec leur destination proposée.

## 24.2 Assistant d'import & mapping `[MVP]`
- **Écran & interactions** : wizard en 4 étapes — (1) choisir la source + s'authentifier ; (2) choisir le repo/projet ; (3) **Roost scanne** et affiche ce qu'il a détecté (règles/conventions, serveurs MCP, skills/agents) en **cases cochables** ; (4) confirmer → un **workspace** est créé avec le **contexte partagé prérempli**, les **MCP attachés**, et des **agents suggérés** (visibles en mode Construction).
- **Critères** : `- [ ]` à la fin, le workspace existe ; `- [ ]` le contexte partagé contient les règles détectées ; `- [ ]` les MCP détectés sont attachés ; `- [ ]` les agents suggérés apparaissent.
- **Provenance** : `Workspace` gagne `source` (`git` | `local` | `import`), `importedFrom` (outil détecté) et `provenance` (Json : fichiers détectés).

---

# 25. Moteur d'aperçu du travail des agents (Live Preview)

## 25.1 Le moteur `[MVP : web + markdown ; étendu v2]`
- **Objectif** : **voir** le résultat du travail des agents en direct, pas seulement le diff.
- **Fonctionnement** : pour un workspace web, le moteur **lance/relève le serveur de dev dans le sandbox** et expose un **port** via une **URL d'aperçu scoped et éphémère**, que Roost embarque dans un **iframe**. Pour un document/markdown → **rendu live**. **Auto-rafraîchissement** sur les events `file.changed`. Détection du type de projet (framework, port, commande de dev).
- **Critères** : `- [ ]` pendant qu'un agent modifie une app web, l'aperçu se met à jour automatiquement ; `- [ ]` un document markdown s'affiche **rendu**.

## 25.2 L'écran d'aperçu `[MVP]`
- **Écran & interactions** : **vue scindée** Activité/Diff ↔ **Aperçu** (onglet « Aperçu » de la fiche agent / du détail de mission). Contrôles : **rafraîchir**, **ouvrir dans un nouvel onglet**, **cadres d'appareil** (mobile/tablette/desktop) + largeur responsive, **console/logs**, sélection de la route/URL.
- **Critères** : `- [ ]` basculer entre diff et aperçu ; `- [ ]` changer le cadre d'appareil ; `- [ ]` ouvrir l'aperçu en plein écran.

## 25.3 Sécurité de l'aperçu `[MVP]`
- iframe **sandboxée** (`sandbox` + CSP) ; URL d'aperçu **scoped au run/utilisateur**, **non devinable**, éphémère, **détruite avec le sandbox** ; **aucune fuite cross-tenant**.
- **Critères** : `- [ ]` l'URL d'aperçu n'est **pas** accessible hors session/tenant ; `- [ ]` elle expire à la fin du run.

> **Impact design** : profil, comptes liés, historique des conversations, assistant d'import et la vue d'aperçu sont ajoutés au brief de design (section « Écrans & composants additionnels — vague 2 »).
