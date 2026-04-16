# StudySquad Debug

## But

Diagnostiquer rapidement un probleme sans perdre la cohérence du projet ni introduire des contournements fragiles.

## Checklist de diagnostic

- verifier le type du probleme: UI, type, donnees, Supabase, routing, animation;
- lire la source de verite dans `src/types` et `sql_v1.sql`;
- identifier si le bug vient d'une forme de donnees mal mappee;
- verifier les cas `null`, `undefined`, tableaux vides et relations absentes;
- inspecter les composants enfants avant de modifier les parents.

## Erreurs frequentes

- utiliser un champ qui n'existe pas dans la table SQL;
- supposer qu'une relation Supabase est toujours presente;
- contourner une erreur TypeScript avec un cast trop large;
- melanger logique UI et logique d'acces aux donnees;
- injecter un `any` pour aller plus vite.

## Methode

- reproduire mentalement le flux complet;
- localiser la premiere valeur invalide;
- corriger a l'endroit ou les donnees entrent dans le systeme;
- ajouter une protection ou un typage si le probleme est recurrent;
- verifier que la correction reste compatible avec le schema et les types.
