# Ticket de mise en route — Roost · Jalon 0 (à coller dans Claude Code)

Tu vas démarrer le projet **Roost** (plateforme de gestion d'agents IA façon *Les Sims*). La spec complète est dans `spec-agentsims-claude-code.md` et les tokens visuels dans `design-tokens-agentsims.css`. **Lis-les d'abord**, puis réalise le **Jalon 0** ci-dessous. Ne va pas plus loin que le Jalon 0 sans mon feu vert.

## Stack (actée)
TypeScript partout · **monorepo pnpm + Turborepo** · Next.js (App Router) + Tailwind + shadcn/ui côté front · Node/TS pour l'orchestrateur · Prisma + **Postgres** · BullMQ + **Redis** · WebSocket (`ws`) · Auth.js · Zod. Déploiement cible : Vercel (front) + Fly.io (orchestrateur). Sandbox : E2B (plus tard).

## Structure de repo à créer
```
roost/
  apps/
    web/            # Next.js : UI + routes API + client WebSocket
    orchestrator/   # service Node : API métier, workers BullMQ, hub WebSocket, moteurs
  packages/
    shared/         # types & schémas Zod : AgentEvent, AgentEngine, StartRunInput…
    db/             # Prisma schema + client
    ui/             # composants partagés + import des design tokens
  .env.example
  turbo.json
  pnpm-workspace.yaml
```

## Variables d'environnement (`.env.example`)
Nécessaires au **Jalon 0** :
```
DATABASE_URL=
REDIS_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```
À prévoir (commentées, pour plus tard) : `KMS_*`, `E2B_API_KEY`, `GITHUB_APP_ID/PRIVATE_KEY`, `STRIPE_SECRET_KEY/WEBHOOK_SECRET`, `ANTHROPIC`/`GEMINI` (BYOK, gérées en base, pas en env global).

## Périmètre du Jalon 0 (squelette qui tourne)
1. Monorepo initialisé (pnpm + Turborepo), lint + typecheck + Prettier configurés.
2. **Auth.js** : connexion Google **et** email fonctionnelle ; page de login ; session protégée.
3. **Prisma + Postgres** : modèle `User` au minimum, migration appliquée, client généré dans `packages/db`.
4. **Redis** branché (BullMQ + pub/sub) ; un worker minimal qui émet un **événement factice** toutes les 3 s.
5. **WebSocket** : le front s'abonne au canal `user:<id>` et **affiche l'événement factice en direct** (sans rechargement).
6. **Design tokens appliqués** : importer `design-tokens-agentsims.css`, reporter l'extrait Tailwind, et styler la page d'accueil avec la palette (crème/terracotta/teal) + typo (Bricolage Grotesque / Inter).
7. README de repo avec les commandes de dev.

## Definition of Done (Jalon 0)
- [ ] `pnpm dev` lance front + orchestrateur sans erreur.
- [ ] Je peux me connecter (Google **et** email) et atteindre une page protégée.
- [ ] Un événement factice apparaît **en temps réel** dans l'UI via WebSocket.
- [ ] La page d'accueil utilise les design tokens (couleurs + typo de marque).
- [ ] lint + typecheck + un test de fumée passent en CI (GitHub Actions).

## Règles de travail
- Demande-moi avant toute opération destructrice (suppression, `git push`, migration destructive).
- Écris au moins un test par critère de DoD vérifiable.
- Vérifie la doc officielle à jour avant d'intégrer une lib externe.
- Utilise **exclusivement** les design tokens (aucune valeur de couleur/typo en dur).
- Commits conventionnels (`feat:`, `chore:`…), petites PR.

## Tes premières actions
1. Renvoie-moi un **plan court** (arbo + libs choisies + ordre des étapes) et attends mon OK.
2. Puis échafaude le monorepo et avance le Jalon 0 étape par étape, en cochant la DoD.

> Jalons suivants (pour info, ne pas commencer) : J1 « un agent Claude vivant », J2 « le Monde des Sims », J3 « moteur Gemini », J4 « productivité ». Détails dans la spec §10.
