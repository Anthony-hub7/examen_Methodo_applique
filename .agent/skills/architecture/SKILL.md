# StudySquad Architecture

## But

Aider a construire et faire evoluer l'application sans casser le contrat fonctionnel ni la structure du projet.

## Vue d'ensemble

- `src/pages` contient les ecrans;
- `src/components` contient les blocs reutilisables;
- `src/services` contient les requetes Supabase et la logique d'acces aux donnees;
- `src/hooks` contient les comportements reutilisables;
- `src/context` contient l'etat global;
- `src/types` contient le contrat central du domaine.

## Regles d'architecture

- les pages orchestrent, les composants affichent, les services parlent aux donnees;
- les hooks ne doivent pas dupliquer la logique metier des services;
- les types metier viennent d'une source unique;
- garder les interfaces proches des tables SQL quand c'est pertinent;
- isoler les transformations de donnees dans des helpers explicites.

## Cartographie metier

- Auth: connexion, inscription, session, profil;
- Groupes: creation, invitation, adhesion, sortie, membres;
- Devoirs: creation, liste, detail, etat, priorite, deadline;
- Chat: messages de groupe;
- Posts: commentaires, aide, annonces;
- Notifications: alertes utilisateur.

## Bonne pratique

- penser d'abord aux dependances de donnees;
- verifier les relations avant de composer les ecrans;
- nommer les fonctions selon l'action metier;
- garder les composants de presentation sans logique lourde;
- si un nouveau type est necessaire, le declarer dans `src/types` plutot que localement.
