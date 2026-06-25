# Roadmap & lancement — Roost

> Durées indicatives (à ajuster selon ton rythme). L'idée : sortir vite une beta privée utile, mesurer, puis lancer public.

## Phases

### Phase 0 — Fondations *(build, Jalons 0→2)*
Squelette qui tourne → un agent Claude vivant → le Monde des Sims (roster, vitals, task board, revue, ⌘K). Instrumentation analytics dès le Jalon 1.
**Sortie de phase :** je peux piloter visuellement un agent Claude de bout en bout.

### Phase 1 — Beta privée *(Jalons 3→4)*
Moteur Gemini (Claude + Gemini en parallèle) → productivité (Git/PR, recettes, snapshots, détection de blocage, contexte partagé, analytics basiques). **5 à 10 design partners.** Boucle de feedback hebdo.
**Sortie de phase :** golden path stable + 3 témoignages + activation ≥ cible.

### Phase 2 — Lancement public *(Jalon 5 — polish)*
Landing live, Stripe + paliers, onboarding soigné, états vides, perfs, a11y. Démo vidéo. Product Hunt + Hacker News + posts X/LinkedIn.
**Sortie de phase :** inscriptions self-serve + premières conversions payantes.

### Phase 3 — Croissance
Intégrations (Slack/Jira/Linear), marketplace d'agents/recettes, features Team/Entreprise (RBAC, audit, budgets, SSO), SEO/contenu.

## Roadmap produit — Now / Next / Later
- **Now (V1)** : core (studio, agents Claude+Gemini, missions, revue, coûts, permissions) · Git/PR · magasin MCP basique · recettes · snapshots/rollback · détection de blocage · contexte partagé · analytics basiques.
- **Next** : studio partagé + RBAC · budgets/audit équipe · intégrations Slack/Jira · standup quotidien · duels A/B.
- **Later** : marketplace payant · agents always-on planifiés · white-label/on-prem · SSO/SAML · capture vocale.

## Check-list de lancement (public)

**Produit**
- [ ] Golden path stable de bout en bout
- [ ] Onboarding + seed data (le foyer de 6 agents)
- [ ] États vides, erreurs, reconnexion temps réel
- [ ] Perfs (latence events < 500 ms p95) & accessibilité AA

**Sécurité** *(voir threat-model)*
- [ ] Check-list de sécurité pré-lancement validée
- [ ] Pentest léger / revue de sécurité

**Légal & paiement** *(voir trames légales)*
- [ ] Entité juridique · marque + domaine sécurisés
- [ ] CGU + confidentialité + DPA en ligne
- [ ] Stripe (Checkout + Portal + webhooks vérifiés)

**Marketing**
- [ ] Landing live + OG image + favicon
- [ ] Vidéo démo (60 s, golden path)
- [ ] Comptes sociaux (@roosthq…) + waitlist
- [ ] Page comparatif / battlecard

**Mesure & support**
- [ ] Analytics instrumentés + dashboards (activation, rétention, NSM)
- [ ] Alerting (Sentry + métriques)
- [ ] Doc d'aide + canal de feedback + page de statut

## Critères de « go » beta → public
Activation ≥ 40 % · golden path sans bug bloquant · check-list sécurité validée · Stripe opérationnel · 3 témoignages de design partners.
