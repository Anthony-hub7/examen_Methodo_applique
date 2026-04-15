// ======================================
// 1. MEMBERS (Utilisateurs)
// ======================================
export type UserRole = 'student' | 'admin';

export interface Member {
  id: string; // UUID
  name: string;
  email: string;
  role: UserRole;
  niveau_etude?: string;
  created_at: string; // ISO timestamp
}

// ======================================
// 2. GROUPS (Groupes)
// ======================================
export interface Group {
  id: string; // UUID
  name: string;
  description?: string;
  code_invitation: string;
  created_by: string; // UUID (Member ID)
  created_at: string; // ISO timestamp
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
  memberCount: number;
}

// ======================================
// 3. GROUPS_MEMBER (Membres du groupe)
// ======================================
export type GroupMemberRole = 'member' | 'moderator';

export interface GroupMember {
  id: string; // UUID
  member_id: string; // UUID
  group_id: string; // UUID
  role_devoir: GroupMemberRole;
  actif: boolean;
  joined_at: string; // ISO timestamp
}

export interface GroupMemberWithDetails extends GroupMember {
  member?: Member;
}

// ======================================
// 4. DEVOIRS (Tâches / Devoirs)
// ======================================
export type DevoirState = 'à faire' | 'en cours' | 'terminé';
export type DevoirPriority = 'faible' | 'moyenne' | 'haute';

export interface Devoir {
  id: string; // UUID
  titre: string;
  etat: DevoirState;
  sujet?: string;
  deadline?: string; // ISO date
  priorite: DevoirPriority;
  group_id?: string; // UUID (null si mode solo)
  member_id: string; // UUID
  created_at: string; // ISO timestamp
}

export interface DevoirWithDetails extends Devoir {
  member?: Member;
  group?: Group;
  posts?: Post[];
  isLate?: boolean;
  isCompleted?: boolean;
}

// ======================================
// 5. POSTS (Commentaires / Aide)
// ======================================
export type PostType = 'commentaire' | 'aide' | 'annonce';

export interface Post {
  id: string; // UUID
  type: PostType;
  commentaire?: string;
  reaction?: string;
  nb_vue: number;
  devoir_id: string; // UUID
  member_id: string; // UUID
  created_at: string; // ISO timestamp
}

export interface PostWithDetails extends Post {
  member?: Member;
}

// ======================================
// 6. CHAT (Messages du groupe)
// ======================================
export interface ChatMessage {
  id: string; // UUID
  message: string;
  group_id: string; // UUID
  member_id: string; // UUID
  created_at: string; // ISO timestamp
}

export interface ChatMessageWithDetails extends ChatMessage {
  member?: Member;
}

// ======================================
// 7. NOTIFICATIONS
// ======================================
// ⚠️ Correspond exactement à la table SQL (pas de champ 'type')
export interface Notification {
  id: string; // UUID
  content: string;
  is_read: boolean;
  user_id: string; // UUID
  created_at: string; // ISO timestamp
}

export interface NotificationWithDetails extends Notification {
  member?: Member;
  devoir?: Devoir;
}

// ======================================
// 8. FORM TYPES
// ======================================
export interface CreateDevoirInput {
  titre: string;
  sujet?: string;
  deadline?: string;
  priorite: DevoirPriority;
  group_id?: string;
}

export interface UpdateDevoirInput {
  titre?: string;
  etat?: DevoirState;
  sujet?: string;
  deadline?: string;
  priorite?: DevoirPriority;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
}

export interface JoinGroupInput {
  code_invitation: string;
}

export interface SendChatMessageInput {
  message: string;
  group_id: string;
}

export interface SendPostInput {
  type: PostType;
  commentaire?: string;
  reaction?: string;
  devoir_id: string;
}

// ======================================
// 9. AUTH TYPES
// ======================================
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
}

export interface AuthSession {
  user: AuthUser | null;
  session: unknown;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
  niveau_etude?: string;
}

// ======================================
// 10. FILTER TYPES
// ======================================
export interface DevoirFilters {
  state?: DevoirState;
  priority?: DevoirPriority;
  group_id?: string;
  sortBy?: 'deadline' | 'priority' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface ChatFilters {
  group_id: string;
  limit?: number;
  offset?: number;
}

// ======================================
// 11. API RESPONSE TYPES
// ======================================
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ======================================
// 12. ERROR TYPES
// ======================================
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}