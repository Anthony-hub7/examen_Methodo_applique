# StudySquad Rules

## But

Garantir la coherence technique du projet avec le schema SQL, les types partages et les bonnes pratiques de Typage TypeScript.

## Regles essentielles

- ne jamais introduire de `any`;
- utiliser les types existants dans `studysquad/src/types/index.ts` avant de creer un nouveau type;
- aligner toute forme de donnees avec `studysquad/public/sql/sql_v1.sql`;
- typer explicitement les retours de fonctions de service et de hooks;
- preferer `unknown` a `any` quand une valeur n'est pas encore verifiee.

## Donnees

- `members` correspond aux profils utilisateurs;
- `groups` et `groups_member` gerent les equipes;
- `devoirs` porte l'etat, la priorite et la deadline;
- `posts`, `chat` et `notifications` sont des entites relationnelles secondaires;
- toute relation Supabase doit etre lue comme potentiellement nullable.

## Qualite de code

- declarer les interfaces pour les payloads d'entree;
- utiliser des unions litterales pour les enums metier;
- eviter les cast inutiles;
- isoler la logique d'acces aux donnees dans `src/services`;
- remonter des erreurs claires et actionnables.

## Validation avant livraison

- verifier que les types imports compilent;
- verifier que les composants consomment bien les props attendues;
- s'assurer que les cas `null` et `undefined` sont geres;
- verifier que les textes et labels restent coherents avec le vocabulaire du projet.
