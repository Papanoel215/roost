# Threat model & sécurité — Roost

> Roost exécute du code d'agents pour des utilisateurs, en hébergé multi-tenant. **Principe fondateur : tout ce qu'un agent produit ou tente est non fiable par défaut ; tout effet de bord est filtré.**

## 1. Ce qu'on protège (assets)
- **Clés API BYOK** des utilisateurs (Anthropic, Gemini, GitHub, etc.).
- **Code & données** des utilisateurs (workspaces, diffs, logs).
- **Isolation multi-tenant** (aucun croisement entre comptes).
- **Intégrité des runs** (un agent ne fait que ce qui est autorisé).
- **Disponibilité** de la plateforme.

## 2. Frontières de confiance
1. Navigateur ↔ API (entrées utilisateur — à valider).
2. Orchestrateur ↔ **sandbox** (le code de l'agent = **zone non fiable**).
3. Sandbox ↔ Internet (egress à filtrer).
4. Plateforme ↔ fournisseurs tiers (Anthropic/Google/GitHub/Stripe).

## 3. Menaces principales & mitigations

| Menace | Mitigation |
|---|---|
| **Évasion de sandbox / code malveillant** | Sandbox isolé **éphémère** (E2B/Firecracker), jamais d'exécution sur l'hôte, ressources plafonnées, egress filtré, destruction post-run. |
| **Fuite de secrets (clés BYOK)** | Chiffrement **enveloppe** (KMS) ; déchiffrement **en mémoire worker uniquement** ; jamais loggé ; redaction des logs ; ne pas exposer les clés brutes au sandbox sauf strict besoin. |
| **Accès cross-tenant** | **Postgres RLS** + garde applicative ; scoping `userId`/`orgId` ; tests d'isolation automatisés. |
| **Prompt injection** (contenu lu par l'agent → instructions malveillantes : exfiltration, actions non voulues) | Permissions `ASK` pour actions sensibles ; allowlist d'outils ; **l'agent n'a pas accès aux secrets bruts** ; egress filtré ; human-in-the-loop pour le risque élevé ; ne pas injecter de secrets dans le contexte. |
| **Coût qui s'emballe / abus** | Plafonds par agent & par user ; détection de boucle → **auto-pause** ; quotas par palier ; rate-limiting. |
| **Compromission de compte/session** | Auth.js ; **MFA** (option) ; sessions courtes + refresh ; CSRF ; journal d'audit. |
| **Dépendances vulnérables (supply chain)** | Scan de dépendances (agent Sentinel + Dependabot) ; lockfiles ; pinning ; revue avant montée de version. |
| **Webhooks falsifiés (GitHub/Stripe)** | Vérification **obligatoire** de la signature. |
| **DoS** | Rate-limiting, quotas, timeouts par run et par appel d'outil. |
| **Données en transit / au repos** | TLS partout ; chiffrement au repos (base, object storage, snapshots). |

## 4. Check-list de sécurité pré-lancement
- [ ] Sandboxes isolés, éphémères, ressources plafonnées, egress en allowlist
- [ ] Secrets : chiffrement enveloppe KMS + déchiffrement en mémoire + redaction des logs
- [ ] Postgres RLS activé + tests d'isolation multi-tenant qui passent
- [ ] Permissions `ASK` par défaut sur les actions sensibles ; allowlist d'outils par agent
- [ ] Vérification de signature des webhooks (GitHub, Stripe)
- [ ] Rate-limiting + quotas + timeouts en place
- [ ] Journal d'audit des actions sensibles et des approbations
- [ ] Plafonds de coût + détection de boucle + auto-pause
- [ ] TLS + chiffrement au repos vérifiés
- [ ] Sauvegardes BD + procédure de restauration testée
- [ ] **Kill switch** global opérationnel
- [ ] Pentest léger / revue de sécurité avant le public

## 5. Réponse à incident (minimum)
- Détection : alerting sur erreurs (Sentry) et métriques anormales (coût, échecs).
- Confinement : **arrêt d'urgence** global + isolation du run/compte concerné.
- Éradication/rétablissement : rotation des clés impactées, purge des sandboxes.
- Notification : informer les utilisateurs concernés (et autorités si requis par le RGPD).
- Post-mortem : journal, cause racine, correctif.

## 6. Conformité
- **RGPD** : export & suppression des données (droit à l'effacement) ; rétention configurable ; registre des traitements.
- **DPA** disponible pour les clients B2B (voir trames légales).
- **SOC 2** : roadmap pour le palier Entreprise.
