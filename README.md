# StudySquad

StudySquad est une application de suivi de devoirs et de collaboration scolaire pensee pour fonctionner en mode solo ou en groupe.

Le projet s'appuie sur une base de donnees Supabase, une interface React + TypeScript, Tailwind CSS pour le style, Iconify pour les icones et Framer Motion pour les animations.

## Concept

L'application aide un eleve ou un etudiant a:

- creer et suivre ses devoirs;
- rejoindre ou creer des groupes de travail;
- discuter dans un chat de groupe;
- signaler une demande d'aide ou un besoin urgent;
- recevoir des notifications et garder une vue claire sur son organisation.

Le concept central est simple: reunir dans un seul espace la gestion des taches, la collaboration et la visibilite sur l'avancement.

## Metier

Le modele fonctionnel repose sur les entites suivantes:

- `members`: comptes utilisateurs et profils;
- `groups`: groupes de travail avec code d'invitation;
- `groups_member`: appartenance et role des membres dans un groupe;
- `devoirs`: devoirs, priorite, etat et deadline;
- `posts`: publications liees a un devoir pour commentaire, aide ou annonce;
- `chat`: messages de groupe;
- `notifications`: alertes personnelles.

## Direction visuelle

L'identite visuelle suit une ambiance sombre et energique:

- fond noir avec accents rouges;
- cartes translucides et effets de glow;
- composants nets et contrastes forts;
- animations fluides mais sobres;
- icones compactes et expressives via Iconify.

La base de style a privilegier:

- Tailwind CSS pour la composition;
- Framer Motion pour les transitions et les entrees de blocs;
- Iconify pour les pictogrammes;
- typographie lisible et structure visuelle claire;
- pas de `any`, uniquement des types explicites issus de `studysquad/src/types`.

## Architecture

Le front est organise autour de:

- `src/pages` pour les ecrans;
- `src/components` pour les blocs reutilisables;
- `src/services` pour l'acces aux donnees Supabase;
- `src/hooks` pour la logique reutilisable;
- `src/context` pour l'etat transversal;
- `src/types` pour le contrat de donnees.

## Documents

- Diagramme de classes: `doc/diagramme-de-classe.md`
- Regles de style et de travail: `.agent/skills`

## Rappels de qualite

- respecter le schema SQL fourni dans `studysquad/public/sql/sql_v1.sql`;
- preferer des types imports depuis `studysquad/src/types/index.ts`;
- eviter les champs implicites et les `any`;
- garder les composants lisibles et composes;
- traiter les erreurs Supabase avec des messages explicites.
