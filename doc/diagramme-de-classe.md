# Diagramme de classes

Le diagramme ci-dessous resume le modele de donnees de `studysquad/public/sql/sql_v1.sql` et son equivalence cote TypeScript.

```mermaid
classDiagram
direction LR

class Member {
  +string id
  +string name
  +string email
  +UserRole role
  +string? niveau_etude
  +string created_at
}

class Group {
  +string id
  +string name
  +string? description
  +string code_invitation
  +string created_by
  +string created_at
}

class GroupMember {
  +string id
  +string member_id
  +string group_id
  +GroupMemberRole role_devoir
  +boolean actif
  +string joined_at
}

class Devoir {
  +string id
  +string titre
  +DevoirState etat
  +string? sujet
  +string? deadline
  +DevoirPriority priorite
  +string? group_id
  +string member_id
  +string created_at
}

class Post {
  +string id
  +PostType type
  +string? commentaire
  +string? reaction
  +number nb_vue
  +string devoir_id
  +string member_id
  +string created_at
}

class ChatMessage {
  +string id
  +string message
  +string group_id
  +string member_id
  +string created_at
}

class Notification {
  +string id
  +string content
  +boolean is_read
  +string user_id
  +string created_at
}

class UserRole {
  <<enumeration>>
  student
  admin
}

class GroupMemberRole {
  <<enumeration>>
  member
  moderator
}

class DevoirState {
  <<enumeration>>
  "à faire"
  "en cours"
  terminé
}

class DevoirPriority {
  <<enumeration>>
  faible
  moyenne
  haute
}

class PostType {
  <<enumeration>>
  commentaire
  aide
  annonce
}

Member ||--o{ Group : created_by
Member ||--o{ GroupMember : member_id
Group ||--o{ GroupMember : group_id
Group ||--o{ Devoir : group_id
Member ||--o{ Devoir : member_id
Devoir ||--o{ Post : devoir_id
Member ||--o{ Post : member_id
Group ||--o{ ChatMessage : group_id
Member ||--o{ ChatMessage : member_id
Member ||--o{ Notification : user_id
```

## Lecture rapide

- `Member` represente l'utilisateur authentifie.
- `Group` porte le code d'invitation et le createur.
- `GroupMember` relie un membre a un groupe avec un role et un statut actif.
- `Devoir` peut etre rattache a un groupe ou rester en solo.
- `Post` couvre les echanges et demandes d'aide autour d'un devoir.
- `ChatMessage` contient la messagerie de groupe.
- `Notification` sert aux alertes personnelles.
