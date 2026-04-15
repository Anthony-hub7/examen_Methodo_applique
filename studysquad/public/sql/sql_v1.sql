-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chat (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message text NOT NULL,
  group_id uuid NOT NULL,
  member_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_pkey PRIMARY KEY (id),
  CONSTRAINT chat_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT chat_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id)
);
CREATE TABLE public.devoirs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  etat text DEFAULT 'à faire'::text CHECK (etat = ANY (ARRAY['à faire'::text, 'en cours'::text, 'terminé'::text])),
  sujet text,
  deadline date,
  priorite text DEFAULT 'moyenne'::text CHECK (priorite = ANY (ARRAY['faible'::text, 'moyenne'::text, 'haute'::text])),
  group_id uuid,
  member_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT devoirs_pkey PRIMARY KEY (id),
  CONSTRAINT devoirs_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT devoirs_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id)
);
CREATE TABLE public.groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  code_invitation text NOT NULL UNIQUE,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT groups_pkey PRIMARY KEY (id),
  CONSTRAINT groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.members(id)
);
CREATE TABLE public.groups_member (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  group_id uuid NOT NULL,
  role_devoir text DEFAULT 'member'::text,
  actif boolean DEFAULT true,
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT groups_member_pkey PRIMARY KEY (id),
  CONSTRAINT groups_member_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id),
  CONSTRAINT groups_member_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id)
);
CREATE TABLE public.members (
  id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text DEFAULT 'student'::text,
  niveau_etude text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT members_pkey PRIMARY KEY (id),
  CONSTRAINT members_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  content text NOT NULL,
  is_read boolean DEFAULT false,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.members(id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type = ANY (ARRAY['commentaire'::text, 'aide'::text, 'annonce'::text])),
  commentaire text,
  reaction text,
  nb_vue integer DEFAULT 0,
  devoir_id uuid NOT NULL,
  member_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_devoir_id_fkey FOREIGN KEY (devoir_id) REFERENCES public.devoirs(id),
  CONSTRAINT posts_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id)
);