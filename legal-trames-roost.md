# Trames légales de départ — Roost

> ⚠️ **Ceci n'est pas un conseil juridique.** Ce sont des **squelettes** de ce que chaque document devrait couvrir pour un produit comme Roost (hébergé, multi-tenant, BYOK, exécution de code). **Fais-les rédiger/valider par un juriste** avant publication, et adapte au droit applicable.

---

## 1. Conditions Générales d'Utilisation (CGU)
À couvrir :
- **Parties & objet** : qui fournit le service, description (orchestration d'agents IA).
- **Comptes** : création, exactitude des infos, sécurité des identifiants, âge minimum.
- **BYOK** : l'utilisateur fournit ses propres clés API tierces et **reste responsable** de leur usage et du respect des conditions d'Anthropic/Google/GitHub/etc. ; Roost agit comme intermédiaire technique.
- **Usage acceptable** : interdiction d'usages illégaux, de production de code malveillant, d'atteinte à la sécurité, d'abus des ressources (sandboxes).
- **Propriété intellectuelle** : l'utilisateur conserve la propriété de son code et de ses données ; Roost conserve la propriété de sa technologie/marque ; licence limitée d'utilisation du service.
- **Contenus & responsabilité des sorties** : les sorties des agents sont fournies « en l'état » ; l'utilisateur est responsable de leur revue et de leur usage.
- **Paiement** : paliers, facturation via Stripe, renouvellement automatique, conditions de remboursement, taxes.
- **Disponibilité** : aucune garantie de disponibilité hors engagement Entreprise ; maintenance.
- **Limitation de responsabilité & garanties** : exclusions, plafond de responsabilité.
- **Résiliation** : par l'utilisateur / par Roost, effets (suppression des données).
- **Modifications des CGU**, **droit applicable & juridiction**, **contact**.

## 2. Politique de confidentialité
À couvrir :
- **Données collectées** : compte (email, nom), données d'usage/analytics, logs, **clés API stockées chiffrées**, contenus de workspace traités le temps des runs.
- **Finalités** : fourniture du service, sécurité, facturation, amélioration produit, support.
- **Base légale (RGPD)** : exécution du contrat, intérêt légitime, consentement (analytics/cookies).
- **BYOK & IA** : Roost **n'utilise pas** le code/les données des utilisateurs pour entraîner des modèles.
- **Sous-traitants** : à lister (ex. Anthropic, Google, E2B, Stripe, hébergeurs Vercel/Fly, PostHog, Sentry) avec leur rôle.
- **Transferts hors UE** : mécanismes (clauses contractuelles types) le cas échéant.
- **Durées de rétention** : par type de donnée (ex. logs/events 90 j configurable, suppression à la clôture du compte).
- **Droits RGPD** : accès, rectification, **export**, **effacement**, opposition ; comment les exercer.
- **Cookies & analytics** : finalités, consentement, opt-out.
- **Sécurité** : renvoi aux mesures (chiffrement, isolation) — voir threat-model.
- **Contact / DPO**, **modifications de la politique**.

## 3. DPA (Data Processing Agreement) — pour les clients B2B
À couvrir :
- **Rôles** : le client = responsable de traitement, Roost = sous-traitant.
- **Objet, durée, nature & finalité** du traitement ; **catégories de données** et de personnes.
- **Instructions** : Roost traite sur instruction documentée du client.
- **Confidentialité** du personnel ; **mesures de sécurité** (annexe technique : chiffrement, isolation multi-tenant, sandboxes, audit).
- **Sous-traitants ultérieurs** : liste + obligation d'information/objection.
- **Assistance** : aide aux demandes des personnes concernées et aux analyses d'impact.
- **Notification de violation** de données (délais).
- **Sort des données** en fin de contrat : restitution / suppression.
- **Audits** : droit d'audit du client.
- **Transferts internationaux** : clauses types.

## 4. Mentions transverses à ne pas oublier
- Bandeau **cookies/consentement** (analytics).
- Mention **BYOK & non-entraînement** visible (argument de confiance — voir landing).
- **Adresse de contact** légale et de sécurité (`security@…`).
- Roadmap conformité (**SOC 2** pour l'Entreprise) communiquée à part, pas dans les CGU.
