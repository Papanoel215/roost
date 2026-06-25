# Différenciation, fonctionnalités premium & go-to-market — AgentSims

> Ce qui transforme le produit en **offre vendable** : les fonctionnalités qui justifient un paiement, le positionnement, les segments, le modèle de prix et les douves. Les tags `[Free]` `[Pro]` `[Team]` `[Entreprise]` indiquent le palier où chaque feature a le plus de valeur.

---

## 1. La proposition de valeur (le pitch)

> **« Pilotez toute une équipe d'agents IA depuis un seul poste de commande — à cheval sur Claude *et* Gemini — avec une visibilité totale, un contrôle humain, et une maîtrise des coûts. »**

Le différenciateur clé (**le « wedge »**), en 3 angles défendables :
1. **Multi-moteur, neutre vis-à-vis du fournisseur.** La plupart des outils sont mono-éditeur (Claude Code = Claude ; Antigravity = surtout Gemini). Toi, tu orchestres **les deux au même endroit** et tu routes chaque tâche vers le bon modèle. Personne ne veut être enfermé chez un seul fournisseur.
2. **La couche de visibilité & contrôle (l'esprit « Sims »).** Le problème n°1 des agents autonomes : on ne **voit** pas ce qu'ils font et on ne leur **fait pas confiance**. Ton interface rend le travail parallèle de plusieurs agents **lisible, approuvable, interruptible**. C'est de l'**observabilité + gouvernance** déguisée en jeu.
3. **Maîtrise des coûts.** Les équipes redoutent la facture qui explose. Budgets par agent/équipe, mise en pause auto, et économies via le routage intelligent des modèles.

---

## 2. Fonctionnalités différenciantes / premium

### A. Collaboration & équipe
- **Studio partagé** `[Team]` — plusieurs humains dans le même « foyer » : ils voient les agents les uns des autres, se passent le relais, commentent. *(Levier d'abonnement par siège.)*
- **Rôles & permissions (RBAC)** `[Team]` — admin / membre / observateur : qui peut lancer, approuver, dépenser.
- **Fil de revue collaboratif** `[Team]` — assigner une revue d'artefact à un collègue, commenter un diff, valider à plusieurs.
- **Liens de run partageables** `[Team]` — envoyer le replay d'un run à un collègue pour debug/revue, comme un PR.

### B. Gouvernance, confiance & conformité (entreprise)
- **Journal d'audit complet** `[Entreprise]` — chaque action d'agent, approbation, dépense, horodatée et exportable.
- **Moteur de politiques d'organisation** `[Entreprise]` — règles centrales : modèles autorisés, plafond de dépense par membre, outils/MCP whitelistés, résidence des données.
- **SSO / SAML / SCIM** `[Entreprise]` — connexion d'entreprise et provisioning.
- **Garanties données** `[Pro+]` — chiffrement, rétention configurable, **BYOK = pas d'entraînement sur tes données**, épinglage de région. *(Lève les blocages à l'achat.)*

### C. Marketplace & écosystème *(effets de réseau)*
- **Magasin de compétences (le « Mode Achat »)** `[Free→]` — installer des MCP/connecteurs sur un agent en un clic (GitHub, Linear, Slack, Postgres…).
- **Marketplace d'agents & de recettes** `[Pro]` — partager/vendre des presets d'agents, des recettes de mission, des bundles de skills. **Revenu via partage de commission.**
- **Catalogue d'agents « métier » prêts à l'emploi** `[Pro]` — agents spécialistes packagés (« Migration Next 13→15 », « Audit sécurité », « Rédacteur de tests »).

### D. Automatisation & autonomie
- **Agents planifiés / always-on** `[Pro/Team]` — agents récurrents qui maintiennent un projet 24/7 (changelog, mises à jour de dépendances, couverture de tests). *« Votre équipe travaille pendant que vous dormez. »*
- **Déclencheurs** `[Team]` — « PR ouverte → l'agent Tests se réveille », « ticket Linear créé → mission ». Webhooks + cron.
- **Découpage & délégation auto** `[Pro]` — un agent « contremaître » éclate un gros objectif et distribue aux autres ; pipelines d'enchaînement.

### E. ROI & optimisation des coûts *(aide l'acheteur à justifier la dépense)*
- **Tableau de bord ROI** `[Team]` — temps gagné estimé, coût par feature, débit, tendances. *De quoi convaincre le boss de l'acheteur.*
- **Arbitrage de coût intelligent** `[Pro]` — routage auto vers le modèle le moins cher capable (Flash vs Opus), avec rapport d'économies. *« On réduit votre facture IA de X %. »*
- **Duels de modèles & évals** `[Pro]` — même tâche sur plusieurs modèles, comparaison qualité/coût/temps pour choisir.

### F. Intégrations & déploiement
- **Intégrations** `[Team]` — GitHub/GitLab, Jira/Linear, Slack/Teams, CI/CD. Chaque intégration = adhérence + argument de vente.
- **API & webhooks de la plateforme** `[Pro+]` — embarquer/automatiser depuis l'extérieur (plateforme-comme-infra).
- **White-label / on-prem / VPC** `[Entreprise]` — pour les orgs sensibles ; palier premium.
- **Contrôle & approbations mobiles (PWA)** `[Free→]` — approuver depuis le téléphone ; *« ne bloquez jamais vos agents »*.
- **Quotas & priorité d'exécution** `[Pro/Team]` — plus d'agents concurrents et de sandboxes plus rapides selon le palier (tiering naturel).

---

## 3. Qui l'achète & pourquoi maintenant

**Segments (par ordre d'attaque) :**
1. **Devs solo / makers** `[Free/Pro]` — self-serve, prix bas. Ton point d'entrée (le « wedge »).
2. **Petites équipes / agences** `[Team]` — par siège + **allocation de coût par client/projet** (les agences adorent refacturer).
3. **Organisations d'ingénierie** `[Entreprise]` — gouvernance, SSO, audit. ACV plus élevé, vient ensuite.

**Pourquoi maintenant :** les agents explosent (Claude Code, Antigravity) mais **l'orchestration, l'observabilité et la gouvernance manquent** — tout le monde jongle entre des terminaux. La fenêtre est ouverte.

---

## 4. Modèle de monétisation

> **Principe clé : en BYOK, tu ne revends pas de tokens** (tu évites la marge négative et les soucis de conformité). Tu factures la **couche d'orchestration, de collaboration et de gouvernance**. Une option « clés gérées » avec marge pourra venir plus tard.

| Palier | Prix indicatif* | Pour qui | Inclut |
|---|---|---|---|
| **Free** | 0 € | Découverte, devs solo | 1 utilisateur, agents concurrents limités, BYOK, recettes communautaires, PWA. |
| **Pro** | ~20–30 €/mois | Maker sérieux | Plus d'agents concurrents, recettes, snapshots/rollback, analytics, routage de coût, sandboxes prioritaires. |
| **Team** | ~40–60 €/siège/mois | Équipes, agences | Studio partagé, RBAC, **budgets & allocation de coût par équipe/projet**, journal d'audit, intégrations (Slack/Jira), base de contexte partagée. |
| **Entreprise** | sur devis | Orgs | SSO/SAML/SCIM, moteur de politiques, on-prem/VPC, white-label, SLA, sécurité/conformité avancées. |
| **Marketplace** | commission | Tous | Partage de revenus sur agents/recettes/skills payants *(plus tard)*. |

*\*Hypothèses de départ à valider (repères marché : Cursor ~20 $/mois, Vercel/Linear ~8–20 $/siège, agents type Devin >500 $/mois). Teste le willingness-to-pay tôt.*

---

## 5. Douves / avantage défendable

- **Neutralité multi-moteur** — difficile à copier pour un éditeur (Anthropic/Google) sans cannibaliser son propre produit.
- **Couche gouvernance + observabilité** — devient collante en équipe (audit, politiques, budgets) : on ne la retire plus.
- **Effets de réseau du marketplace** — plus d'agents/recettes partagés → plus de valeur.
- **Coût de changement via la base de connaissances** — conventions/archi accumulées que tous les agents utilisent.
- **Adhérence des intégrations** — branché à GitHub/Jira/Slack, on ne migre pas facilement.

---

## 6. Risques à connaître (honnête)

- **Risque de plateforme.** Antigravity (surface « Manager »/Mission Control) et Claude Code offrent **déjà** de l'orchestration multi-agent native. → Tu dois être nettement meilleur sur **le cross-éditeur**, **la gouvernance d'équipe** et **l'UX**. C'est ton terrain ; ne te bats pas sur le leur.
- **Marque.** « Sims » est une marque EA → choisis un nom propre (voir le doc d'identité).
- **Coûts/abus des sandboxes hébergées.** Atténué par BYOK + quotas + egress filtré, mais à surveiller.
- **Dépendance aux API en preview** (Interactions API Gemini, certains IDs) → garde les moteurs derrière une abstraction (déjà prévu dans la spec).

---

## 7. Go-to-market & « démo qui tue »

- **Motion PLG** : self-serve gratuit (wedge solo) → **land-and-expand** vers les équipes via le studio partagé et les budgets.
- **La démo qui vend** : *« Regarde 5 agents livrer une feature en parallèle — plan, code, tests, doc, revue — pendant que tu approuves depuis ton téléphone. »* C'est court, visuel, et ça montre les 3 différenciateurs d'un coup.
- **L'UX comme marketing** : le « studio cosy » est distinctif et partageable (captures, clips) — un atout d'acquisition organique.
- **Contenu** : comparatifs de coût par modèle, templates d'équipe sectoriels, études de cas « temps gagné ».

> Prochaine étape utile : choisir **2–3 segments prioritaires** et **1 feature-phare par palier** à mettre en avant, puis caler le prix par des entretiens de willingness-to-pay.

---

# COMPLÉMENTS COMMERCIAUX (dossier complété)

## 8. Validation & actifs de vente (à produire avant/pendant le lancement)
- **Landing page** — copie prête dans `landing-page-agentsims.md` + **vidéo démo 60 s** (le golden path).
- **Waitlist** + **5 à 10 design partners** (gratuit/réduit contre feedback + témoignage).
- **Page « Confiance & sécurité »** (contenu §12 ci-dessous).
- **Calculateur ROI** (canevas §10).
- **Analytics produit** (PostHog) : définir activation / rétention / expansion.

## 9. Tableau comparatif (battlecard)
| Critère | **AgentSims** | Antigravity (Manager) | Claude Code seul | Jongler les terminaux |
|---|---|---|---|---|
| Multi-moteur (Claude + Gemini) | ✅ | ⚠️ surtout Gemini | ❌ Claude | manuel |
| Vue d'ensemble multi-agents temps réel | ✅ studio | ✅ | partiel | ❌ |
| Gouvernance équipe (RBAC / audit / budgets) | ✅ | partiel | ❌ | ❌ |
| Maîtrise des coûts (BYOK / plafonds / routage) | ✅ | partiel | partiel | ❌ |
| Approbations mobiles | ✅ | ❌ | ❌ | ❌ |
| Marketplace agents/recettes | ✅ (roadmap) | ❌ | ❌ | ❌ |

*(À réajuster selon l'état réel des concurrents au moment du lancement.)*

## 10. Canevas de calculateur ROI
- **Entrées** : nb de devs · coût horaire chargé · heures/semaine de tâches automatisables · % de réussite des agents.
- **Sorties** : heures économisées/semaine · € économisés/mois · coût plateforme · **ROI net** · délai de rentabilité.
- **Formule** : économie = devs × h_auto × %réussite × coût_horaire ; net = économie − (abonnement + coût tokens estimé).

## 11. ICP & messaging par segment
- **Maker solo / indie** — douleur : jongler entre agents/terminaux, peur de la facture. → *« Pilote tous tes agents d'un seul endroit, sans exploser ton budget. »*
- **Lead petite équipe / agence** — douleur : visibilité + refacturation client + cohérence. → *« Un studio partagé où ton équipe voit, approuve et facture le travail des agents, par client. »*
- **Eng manager (scale-up)** — douleur : gouvernance, audit, sécurité. → *« L'orchestration d'agents avec les garde-fous que ton org exige. »*

## 12. Contenu « Confiance & sécurité »
- **BYOK** : tes clés, tes données ; **pas d'entraînement** sur ton code.
- Chiffrement au repos (KMS) ; **sandboxes isolés par run** et détruits ; egress filtré.
- Isolation multi-tenant (RLS) ; **journal d'audit** ; rétention configurable ; export & suppression (RGPD).
- Roadmap conformité : **SOC 2** (Entreprise) ; **DPA** disponible.

## 13. Distribution & plan de lancement
- **Pré-lancement** : waitlist + contenu (comparatifs de coût par modèle, « comment piloter 5 agents ») + design partners.
- **Lancement** : Product Hunt + Hacker News + vidéo démo + posts X/LinkedIn ; cibler les communautés Claude/Gemini.
- **Post-lancement** : SEO (pages « X vs Y », use-cases) + boucle de témoignages + offre *founding*.

## 14. Checklist légale & paiement
- [ ] Nom + marque (classe logicielle) + domaine vérifiés
- [ ] Entité juridique créée
- [ ] CGU + politique de confidentialité + DPA
- [ ] Stripe (Checkout + Portal + webhooks)
- [ ] Mentions BYOK / traitement des données

## 15. Détail du gating par palier
| Limite | Free | Pro | Team | Entreprise |
|---|---|---|---|---|
| Utilisateurs | 1 | 1 | par siège | par siège |
| Agents concurrents | 2 | 5 | 10+/siège | custom |
| Runs/mois | limité | élevé | très élevé | illimité |
| Snapshots · recettes · analytics | — | ✅ | ✅ | ✅ |
| Studio partagé · RBAC · audit · budgets équipe | — | — | ✅ | ✅ |
| SSO · politiques · on-prem · white-label · SLA | — | — | — | ✅ |
