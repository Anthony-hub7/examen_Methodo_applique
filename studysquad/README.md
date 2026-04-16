# StudySquad App

Application React + TypeScript pour le suivi de devoirs, la collaboration en groupe et la gestion de l'aide entre membres.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Iconify
- Framer Motion
- Supabase

## Organisation

- `src/pages` pour les ecrans;
- `src/components` pour les blocs reutilisables;
- `src/services` pour les appels Supabase;
- `src/hooks` pour la logique partagee;
- `src/context` pour l'etat global;
- `src/types` pour les types metier;
- `public/sql/sql_v1.sql` pour le schema reference.

## Regles de travail

- ne jamais utiliser `any`;
- importer les types metier depuis `src/types/index.ts`;
- garder les services aligns sur le schema SQL;
- utiliser Tailwind, Iconify et Framer Motion pour le rendu et les animations;
- privilegier des erreurs explicites et des composants lisibles.

## Scripts

- `npm run dev` pour lancer le serveur local;
- `npm run build` pour verifier la compilation;
- `npm run lint` pour controler la qualite du code.
