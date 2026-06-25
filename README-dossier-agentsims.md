# 📁 Dossier Roost — sommaire

Dossier complet pour lancer **Roost**, une plateforme de gestion d'agents IA façon *Les Sims* (Claude + Gemini). Produit, design, marque, go-to-market, sécurité, mesure et légal.

---

## Carte des fichiers

### 🛠️ Construire (pour Claude Code)
| Fichier | Sert à… |
|---|---|
| **spec-agentsims-claude-code.md** | La spec produit complète (architecture, moteurs, données, écrans, sécurité, + compléments techniques & décisions). |
| **kickoff-claude-code-jalon0.md** | Le ticket de démarrage prêt à coller (repo, stack, env, Jalon 0 + DoD). **Commence ici pour builder.** |
| **agents-personas-defaut.md** | Les 6 agents par défaut enrichis (personas, outils/MCP, permissions, DoD, collaboration, aspirations) + traits. |
| **design-tokens-agentsims.css** | Tokens (couleurs/typo/espacements) en variables CSS + Tailwind. Source unique du style. |

### 🎨 Design & marque
| Fichier | Sert à… |
|---|---|
| **design-brief-agentsims-claude-design.md** | Brief visuel pour **Claude Design** (identité + écrans à maquetter). |
| **identite-de-marque-agentsims.md** | Nom (Roost), tagline, voix, logo, domaines/handles, actifs restants. |
| **logo-primaire.svg** | Logo principal (symbole + wordmark). |
| **logo-systeme.svg** | Variantes (icône, inversé, monochrome, palette). |
| **favicon.svg** | Icône d'app / onglet. |
| **og-image-roost.svg** | Image de partage social (landing). |

### 📣 Go-to-market & vente
| Fichier | Sert à… |
|---|---|
| **croissance-monetisation-agentsims.md** | Différenciateurs, paliers, prix, battlecard, ROI, distribution, gating, légal. |
| **landing-page-agentsims.md** | Copie de la page de vente, prête à maquetter. |
| **pitch-1page-roost.md** | Pitch d'une page (partenaires/investisseurs). |

### 🔐 Sécurité, mesure & ops
| Fichier | Sert à… |
|---|---|
| **threat-model-securite-roost.md** | Menaces, mitigations, check-list sécurité, réponse à incident. |
| **metriques-analytics-roost.md** | North-star, funnel AARRR, taxonomie d'événements analytics. |
| **roadmap-lancement-roost.md** | Phases, roadmap Now/Next/Later, check-list de lancement. |

### ⚖️ Légal
| Fichier | Sert à… |
|---|---|
| **legal-trames-roost.md** | Trames CGU / confidentialité / DPA (à valider par un juriste). |

---

## Par où commencer
1. **✅ Nom retenu : Roost.** Reste à sécuriser **marque + domaine** (candidats dans le doc d'identité).
2. **Builder** : colle `kickoff-claude-code-jalon0.md` dans Claude Code (il proposera un plan), puis fournis-lui la spec + les design tokens + les personas.
3. **Maquetter** en parallèle : `design-brief…` puis `landing-page…` dans Claude Design.
4. **Préparer le lancement** : suis `roadmap-lancement-roost.md` (beta privée → public), instrumente les métriques dès le Jalon 1, valide la check-list sécurité.

## Décisions déjà prises
Sandbox **E2B** · déploiement **Vercel + Fly.io** + Postgres/Redis managés · **FR + EN** · périmètre V1 ferme (core + Git/PR, MCP basique, recettes, snapshots, détection de blocage, contexte partagé, analytics) · identité **terracotta + teal**, symbole **plumbob**.

## Ce qui ne dépend que de toi
- Dépôt de **marque** + achat du **domaine**.
- Recrutement des **design partners** + premiers témoignages.
- Validation des **prix** (entretiens willingness-to-pay).
- **Vidéo démo** (une fois le golden path en place).
- Faire **valider les documents légaux** par un juriste.

---

*Le dossier couvre désormais tout le chemin plan → produit → lancement. Il reste surtout des actions humaines (juridique, design partners, démo) et l'exécution du build.*
