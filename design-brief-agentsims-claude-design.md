# Brief de design — **AgentSims** (à coller dans Claude Design)

> Objectif : produire des **maquettes haute fidélité** + un **mini design system** pour un dashboard web qui pilote des agents IA façon *Les Sims*. Ce document décrit le **visuel** ; le comportement détaillé vit dans la spec produit (`spec-agentsims-claude-code.md`).

---

## 1. Le produit en une phrase

Un **studio cosy d'agents IA** : je vois mon équipe d'agents (des « Sims ») travailler en temps réel dans un espace chaleureux, je leur donne des missions, j'approuve leur travail. Certains agents tournent sur Claude, d'autres sur Gemini.

## 2. Concept visuel & ambiance

**« Productivité chaleureuse rencontre un life-sim attachant. »**

- À viser : la **précision calme** d'un bon outil pro (clarté, hiérarchie nette, densité confortable) **+** la **vie et la douceur** d'un jeu de simulation stylisé (personnages ronds, lumière chaude, micro-animations). 
- **Compétence mignonne**, jamais enfantin : c'est un outil de travail sérieux qui se trouve être agréable et vivant.
- **Adjectifs directeurs** : chaleureux · vivant · lisible · rond · posé · ludique-mais-pro.
- **À éviter** : néon agressif, gris corporate froid, dégradés criards, esthétique « gaming RGB », surcharge d'éléments, ombres dures.

## 3. Design system

### 3.1 Couleurs
Thème principal **clair et chaud** ; prévoir une variante **sombre**.

**Neutres chauds (clair)**
- Fond app : `#FAF7F2` (crème)
- Surface / carte : `#FFFFFF`
- Bordure subtile : `#ECE6DD`
- Texte fort : `#2A251F` · Texte secondaire : `#6B6358` · Texte faible : `#A89F92`

**Neutres (sombre)**
- Fond app : `#161311` · Surface : `#211D1A` · Bordure : `#322C27`
- Texte fort : `#F3EEE7` · secondaire : `#B5AB9E`

**Accent**
- Primaire (actions, focus, liens) : **terracotta** `#E07856` (hover `#CC6747`)
- Secondaire (« vivant / actif ») : **teal doux** `#2FB3A3`

**Sémantique du Plumbob & des états** (toujours **doublée d'une icône + label**, jamais la couleur seule)
- Sain 🟢 : `#3DBE7A`
- Attention 🟡 : `#F2B23C`
- Bloqué 🔴 : `#E5564B`

**Couleurs des 4 Vitals** (chacune distincte)
- ⚡ Énergie : or/ambre `#F2A93C`
- 🍔 Motivation : orange `#F07A3C`
- 😊 Humeur : rose corail `#EC6A86`
- 🧠 Clarté : bleu-teal `#3CA7D6`

### 3.2 Typographie
- **Titres / display** : *Bricolage Grotesque* (du caractère, chaleureux mais pro).
- **Corps / UI** : *Inter*.
- **Code / diffs / logs** : *JetBrains Mono*.
- **Échelle** : Display 32/40 · H1 24/32 · H2 20/28 · H3 16/24 · Corps 14/20 · Petit 13/18 · Légende 12/16 · Mono 13/20. Titres en semibold, corps en regular/medium.

### 3.3 Espacement, grille, formes
- Base **4 px**, rythme 8-pt. Barre latérale **240 px**. Padding cartes 16–20 px.
- **Rayons généreux** : cartes 16 px (`2xl`), boutons/champs 12 px, pastilles 999 px, avatars en cercle ou squircle.
- **Ombres douces et chaudes**, faible étalement (cosy, pas dur) :
  - repos `0 2px 8px rgba(60,40,20,.06)` · survol `0 6px 20px rgba(60,40,20,.10)`.

### 3.4 Iconographie & illustration
- **Icônes** : style linéaire arrondi (type Lucide), trait 1.5–2 px, cohérent.
- **Avatars d'agents** : personnages **stylisés, ronds, attachants**, ombrage doux « pâte à modeler / soft-3D ». Une **silhouette/accessoire distinct par classe** :
  - Frontend = pinceau/palette · Backend = engrenage/serveur · Tests = loupe + coche · Recherche = livre/télescope · DevOps = clé à molette/fusée · Docs = plume/parchemin · Refacto = balai/étincelles.
- Au-dessus de chaque agent : un **Plumbob** (diamant à facettes, clin d'œil aux Sims) qui **flotte et oscille doucement** ; sa couleur = l'état.

## 4. Motifs « Sims » spécifiques (signature visuelle)

- **Plumbob** : diamant facetté au-dessus de l'avatar, animation de flottement léger. Couleur = santé. **Toujours accompagné** d'une petite **puce d'état** sous l'agent (ex. « 🟡 Permission », « 🟢 Au travail », « 🔴 Bloqué ») → accessibilité.
- **Barres de Vitals (motives)** : **barres horizontales segmentées** (rappel des jauges de besoins des Sims), chacune avec son icône + sa couleur. Version mini sur la carte agent ; version complète (avec libellé + valeur au survol) dans la fiche.
- **Bulle de pensée** : petit cartouche arrondi au-dessus de l'avatar affichant l'action en cours (« Édite `auth.ts`… », « Lance les tests… »).
- **La Scène / Le Monde** : un **studio cosy en vue isométrique** (ou top-down stylisé) — open-space chaleureux avec bureaux, plantes, lumière douce ; les agents y sont posés. **Mode Construction** = plus clair avec **grille visible** ; **Mode Vie** = pleines couleurs + ambiance animée.

## 5. États des agents (à montrer dans les maquettes)
- **Au travail** : assis à un petit bureau, animation de frappe + bulle de pensée + plumbob 🟢.
- **Au repos (idle)** : posture détendue, « regarde autour », plumbob 🟢, motive Motivation basse.
- **Endormi** (rate-limité / budget épuisé) : grisé + « Zzz », plumbob éteint.
- **En attente de moi** : plumbob 🟡 + puce « Permission » + léger halo pour attirer l'œil.
- **Bloqué / erreur** : plumbob 🔴 + puce d'alerte.

## 6. Écrans à maquetter (livrables)

Pour chacun : **desktop ≥ 1280 px**, thème clair (au moins l'écran 1 aussi en sombre). Indiquer un **état réaliste** (pas vide).

1. **Le Monde — Mode Vie (écran héros).** Barre latérale (Le Monde · Missions · Revue · Timeline · Analytics · Paramètres). Barre supérieure (coût du jour, runs actifs, cloche notifications, bascule Construction/Vie, bouton ⌘K). **Bandeau « Qui a besoin de moi ? »** peuplé (1 agent 🟡 permission, 1 agent 🔴 bloqué). La **Scène** avec ~5 agents dans des états variés (2 travaillent + bulles, 1 idle, 1 dort, 1 en 🟡). → *Aussi en variante sombre.*
2. **Le Monde — Mode Construction.** Même scène, **grille visible**, un agent sélectionné en cours de placement/édition.
3. **Fiche agent (drawer latéral) — run en cours.** En-tête (avatar, nom, classe, modèle, plumbob, boutons Pause/Annuler/Parler/Promouvoir). **4 barres de Vitals** complètes. **Plan** (étapes cochées) + **bulle de pensée** + **journal d'activité live** (liste d'événements lisibles : appels d'outils, fichiers modifiés). Coût en direct.
4. **Création / édition d'agent (formulaire Mode Construction).** Sections : Identité (avatar + nom + classe), Cerveau (moteur Claude/Gemini + modèle), **Personnalité = sélecteur de Trait** (Prudent / Rapide / Économe / Perfectionniste, en cartes), Persona (zone de texte), Compétences (MCP attachés), Permissions (ASK/AUTO + liste d'outils), Budget.
5. **Tableau des missions (task board).** Colonnes : Backlog · En file · En cours · À réviser · Fait. Cartes (titre, avatar de l'agent, priorité, badge « artefact à réviser »), affordance de **drag**.
6. **Modale « Nouvelle mission » + pré-vol.** Champ prompt, workspace + branche, agent, priorité. **Encart d'estimation** bien visible : « **~0,40 $ · ~3 min · ~12k tokens** ». Boutons « Estimer » / « Lancer ».
7. **Revue / Diff viewer + batch review.** Visionneuse de diff (coloration +/-), **résumé « ce que j'ai fait + pourquoi »**, liste des fichiers, boutons **Approuver / Rejeter / Demander une reprise**, et **indices clavier** (`j/k` naviguer, `a` approuver, `r` rejeter).
8. **Demande de permission (notification).** Carte montrant l'**action exacte** (ex. commande shell), un **badge de risque** (low/medium/high), boutons **Autoriser / Refuser**.
9. **Palette de commandes ⌘K.** Overlay centré, champ de recherche, liste d'actions (Nouvelle mission, Aller à l'agent…, Lancer une recette, Pause de tous, **Arrêt d'urgence**).
10. **Onboarding BYOK (wizard 3 étapes).** Étapes : clé Anthropic → clé Gemini → connecter un workspace. Champ de clé **masqué** (`sk-…••••1234`) + bouton « Tester la clé ».
11. **Analytics de productivité.** Cartes de métriques (missions/jour, taux de réussite par modèle, coût par feature) + 2-3 graphiques doux + un bloc « Recommandations de routing ».
12. **Mobile / PWA — vue focalisée.** Écran téléphone montrant le **fil « Qui a besoin de moi ? »** + une **carte d'approbation de permission** tactile, et un **mock de notification push** « Ton agent attend une permission ».
13. **Planche du design system.** Une page récap : palette (clair + sombre), échelle typo, boutons (primaire/secondaire/ghost + états), **Plumbob dans ses 3 états**, **barres de Vitals**, une **galerie d'avatars** par classe, états vides type.

## 7. Layout & responsive
- **Desktop-first** (dashboard) : barre latérale 240 px + zone de contenu + barre supérieure persistante.
- **Tablette** : barre latérale réduite en icônes ; la Scène défile.
- **Mobile / PWA** : pas la Scène complète — une vue d'**action** (fil « Qui a besoin de moi ? », notifications, approbations rapides).

## 8. Thème clair / sombre
- **Clair = principal** (crème chaud). **Sombre = charbon chaud** (pas bleu-froid). Garder l'accent terracotta + teal et les couleurs sémantiques cohérentes entre les deux.

## 9. Motion (intention, pour informer les poses / un éventuel prototype)
- Transitions douces 200–300 ms. **Plumbob** : flottement/oscillation lent. **Agents** : micro-boucles selon l'état (respire / tape / Zzz). Apparition des nouveaux événements en fondu-glissé. **Respecter `prefers-reduced-motion`** (couper les boucles).

## 10. Accessibilité (contraintes qui touchent le design)
- Contrastes **AA** minimum. **Aucun état signalé par la couleur seule** → toujours icône + libellé (puces d'état, plumbob). **Focus visibles** (anneau accent). Cibles tactiles ≥ 44 px sur mobile. Alternatives textuelles aux illustrations.

---

### Pour commencer
Commence par la **planche du design system (écran 13)** et l'**écran héros (1)** pour fixer l'identité, puis décline les autres écrans dans le même langage visuel.

---

## 11. Écrans & composants additionnels (mise à jour — suite des fonctionnalités spec §22)

> Même langage visuel que ci-dessus (crème chaud, terracotta + teal, plumbob, motifs Sims), mêmes règles d'accessibilité (jamais la couleur seule, focus visibles, AA). Desktop ≥ 1280 px sauf écran mobile.

### Nouveaux écrans à maquetter
14. **Onboarding guidé** — après le BYOK : une **check-list d'activation** (clé → workspace → 1re mission) avec barre de progression + carte « Lancer une mission d'exemple ».
15. **Fiche agent — onglet Chat** — conversation avec l'agent : bulles utilisateur/agent, zone de saisie (composer), distinct du journal d'événements (onglets « Chat » / « Activité »).
16. **Recherche globale** — overlay/page de résultats groupés par type (Agents · Missions · Runs · Artefacts) avec filtres.
17. **Paramètres** — gabarit à navigation latérale (Profil · Clés API · Workspaces · Notifications · Facturation · Sécurité · Zone de danger), une sous-page par section.
18. **Facturation & abonnement** — palier actuel, **barres d'usage vs quota** (agents concurrents, runs/mois), boutons Upgrade/Downgrade, liste de factures.
19. **Workspaces & contexte projet** — liste des repos connectés + **éditeur de contexte partagé** (markdown).
20. **Historique des runs** — tableau (statut, coût, durée, artefacts) + vue détail d'un run (timeline) + bouton Export ; état « replay » (lecteur scrubbable).
21. **Magasin de compétences (MCP)** — catalogue de connecteurs en cartes + panneau « Attacher à l'agent ».
22. **Équipe & collaboration** `[Team]` — liste des membres + rôles, présence, fil de commentaires sur un artefact.
23. **Journal d'audit** `[Team]` — table filtrable (acteur, action, date) + export.
24. **Mobile / PWA** — fil « Qui a besoin de moi ? », centre de notifications, **carte d'approbation** (permission + artefact) tactile, suivi d'un run.

### Nouveaux composants
- **Bulle de chat** (utilisateur vs agent) + **composer** (saisie, envoi, indicateur « l'agent réfléchit »).
- **Barre de quota/usage** (segmentée, avec valeur et seuil — réutilise le style des Vitals).
- **Carte de connecteur MCP** (logo, nom, description, bouton Attacher).
- **Badge « En file · position X »** (état d'attente, neutre).
- **Bannière de statut système** (info/maintenance/panne — pleine largeur, dismissable).
- **Carte de plan & facturation** (palier, usage, CTA).
- **Ligne de membre + sélecteur de rôle** ; **fil de commentaires** sur artefact.
- **Navigation de Paramètres** (liste de sections).
- **Liste de résultats de recherche** (groupée par type, raccourcis clavier).
- **Toggles thème (clair/sombre) & langue (FR/EN)** dans le header.
- **Champ de clé masqué** (`sk-…••••1234`) + bouton « Tester ».

### États à couvrir partout
Chargement (skeletons), vide (CTA clair), erreur (message + action), hors-ligne / reconnexion temps réel, quota atteint, fournisseur indisponible.

### Couleurs ajoutées (voir tokens)
- **Info / système** : bleu `#3CA7D6` (bannières d'info/maintenance).
- **En attente / file** : neutre `#A89F92`.
Ces deux teintes sont ajoutées à `design-tokens-agentsims.css` (variables `--color-info`, `--color-pending`).

---

## 12. Écrans & composants additionnels — vague 2 (spec §23–25 : utilisateur, import, aperçu)

> Même langage visuel et mêmes règles d'accessibilité. Réutilise les couleurs sémantiques existantes pour les statuts (Connecté = `healthy`, En cours = `pending`, Expiré/Erreur = `blocked`, Déconnecté = texte atténué). Pas de nouveau token nécessaire.

### Nouveaux écrans à maquetter
25. **Profil** — avatar (upload/généré), nom, handle, fuseau horaire, bio ; aperçu live de l'avatar.
26. **Comptes liés** — 3 groupes en sections : *Méthodes de connexion* (Google/GitHub/email), *Comptes IA* (Anthropic/Gemini), *Intégrations* (GitHub/Linear/Slack), chacun en lignes **logo + nom + badge de statut + bouton Connecter/Déconnecter**.
27. **Historique des conversations** — barre latérale de gauche : liste d'items (titre, avatar de l'agent, date, épingle) + recherche en haut ; au clic, la conversation reprise (fil de chat) s'ouvre à droite.
28. **Assistant d'import de projet** — wizard : (1) cartes de **source** (GitHub / dossier local), (2) sélection du repo, (3) **écran de détection** = liste cochable de ce que Roost a trouvé (règles, MCP, skills/agents) avec leur destination, (4) confirmation + résumé.
29. **Aperçu live (vue scindée)** — moitié gauche Diff/Activité, moitié droite **cadre d'aperçu** (iframe) dans un **mock d'appareil** (sélecteur mobile/tablette/desktop), avec une **barre d'outils d'aperçu** (rafraîchir · ouvrir dans un onglet · console · URL/route) ; montrer aussi l'état « aperçu en construction ».

### Mise à jour : onglets de la fiche agent
La fiche agent (écran 3) passe à **trois onglets** : **Activité · Chat · Aperçu**. Maquetter le sélecteur d'onglets et le contenu Chat (bulles + composer) à côté de l'Aperçu.

### Nouveaux composants
- **Ligne de compte lié** (logo fournisseur + statut + action) et **bouton « Se connecter avec … »** (style OAuth).
- **Item de conversation** (titre, agent, date, icône épingle, menu …).
- **Carte de source d'import** + **liste de détection** (cases à cocher avec icône par type : règle / MCP / skill).
- **Cadre d'appareil** (mock mobile/tablette/desktop) + **barre d'outils d'aperçu** + état « build/loading » et « erreur d'aperçu ».
- **Sélecteur d'onglets** Activité / Chat / Aperçu.

### États à couvrir
Compte expiré (CTA reconnecter), aperçu en construction / en erreur, import sans config détectée (message + import « vierge »), conversation vide, reprise d'une conversation longue.
