# Métriques & analytics — Roost

## North-Star Metric (NSM)
**Missions menées à terme *et approuvées* par utilisateur actif et par semaine.**
Pourquoi : ça capture la **valeur réellement livrée** (un agent a produit un résultat que l'humain a validé), pas juste l'activité. Tout le reste sert cette métrique.

## Le funnel (AARRR) — métriques clés & cibles de départ

| Étape | Métrique | Cible initiale (à valider) |
|---|---|---|
| **Acquisition** | visiteurs landing → inscriptions ; sources | — |
| **Activation** | **premier run réussi *et* approuvé < 24 h** (le « aha ») | ≥ 40 % des inscrits |
| **Rétention** | WAU/MAU ; % lançant ≥ 3 missions/semaine | WAU/MAU ≥ 25 % |
| **Revenu** | conversion Free→payant ; MRR ; ARPU ; churn | conv. ≥ 4 % ; churn < 5 %/mois |
| **Référence** | invitations envoyées ; liens de run partagés | — |

## Métriques de santé produit
- **TTFV** (time-to-first-value) : délai inscription → premier run approuvé.
- Runs/jour · taux de réussite des runs · coût moyen/mission · agents actifs/user.
- Profondeur d'usage : nb d'agents, nb de moteurs utilisés (mono vs Claude+Gemini), missions en parallèle.

## Économie unitaire
- Coût infra par utilisateur actif · sandbox-minutes/mission · marge par palier (rappel : BYOK = pas de coût tokens à ta charge).

## Taxonomie d'événements (PostHog) — à instrumenter
*Nom `snake_case` + propriétés entre parenthèses.*

**Onboarding & setup**
- `signed_up` (source)
- `onboarding_step_completed` (step)
- `api_key_added` (provider) · `api_key_test` (provider, result)
- `workspace_connected` (provider)

**Agents & missions**
- `agent_created` (engine, model, trait, class)
- `mission_created` (priority) · `mission_estimated` (est_cost_usd, est_seconds)
- `mission_started` (engine, model)
- `run_completed` (status, cost_usd, duration_ms, tool_calls)
- `run_failed` (reason, recoverable)
- `permission_requested` (risk) · `permission_resolved` (decision)

**Revue & valeur**
- `artifact_reviewed` (type, decision) · `batch_review_used` (count)
- `pr_opened` (provider)

**Garde-fous**
- `budget_cap_hit` (scope) · `agent_auto_paused` (reason) · `emergency_stop_used`

**Monétisation & croissance**
- `checkout_started` (plan) · `plan_changed` (from, to)
- `invite_sent` · `run_link_shared`

## Outillage & dashboards
- **PostHog** (produit/funnels/cohortes) · **Stripe** (revenu) · **Prometheus/Grafana** (ops & coûts).
- Dashboards à créer : (1) funnel d'activation, (2) cohortes de rétention, (3) **valeur** = missions approuvées/semaine (NSM), (4) économie unitaire.

> Règle : instrumenter ces événements **dès le Jalon 1** (pas après le lancement) pour mesurer l'activation réelle.
