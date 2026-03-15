-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text NOT NULL,
  can_help boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
);
CREATE TABLE public.places (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  location USER-DEFINED,
  source text CHECK (source = ANY (ARRAY['user'::text, 'gsi'::text, 'osm'::text])),
  category text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT places_pkey PRIMARY KEY (id)
);
CREATE TABLE public.post_details (
  post_id uuid NOT NULL,
  price text,
  stock_status text CHECK (stock_status = ANY (ARRAY['在庫あり'::text, '残りわずか'::text, '入荷予定'::text])),
  stock_duration text CHECK (stock_duration = ANY (ARRAY['today'::text, '48hours'::text, '3days'::text, '1week'::text, 'manual'::text])),
  event_date date,
  event_time time without time zone,
  fee text,
  max_participants integer,
  current_participants integer DEFAULT 0,
  help_type text CHECK (help_type = ANY (ARRAY['request'::text, 'share'::text])),
  reward text,
  estimated_time text,
  deadline date,
  requirements ARRAY,
  CONSTRAINT post_details_pkey PRIMARY KEY (post_id),
  CONSTRAINT post_details_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.post_images (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_images_pkey PRIMARY KEY (id),
  CONSTRAINT post_images_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  author_id uuid NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['stock'::text, 'event'::text, 'help'::text, 'admin'::text])),
  title text NOT NULL,
  content text,
  place_id uuid,
  location USER-DEFINED,
  allow_comments boolean DEFAULT true,
  expires_at timestamp with time zone,
  is_ended boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id),
  CONSTRAINT posts_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id)
);
CREATE TABLE public.spatial_ref_sys (
  srid integer NOT NULL CHECK (srid > 0 AND srid <= 998999),
  auth_name character varying,
  auth_srid integer,
  srtext character varying,
  proj4text character varying,
  CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  avatar text,
  phone text,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.whisper_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  whisper_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type = ANY (ARRAY['thanks'::text, 'useful'::text, 'wantToGo'::text, 'funny'::text, 'agree'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT whisper_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT whisper_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT whisper_reactions_whisper_id_fkey FOREIGN KEY (whisper_id) REFERENCES public.whispers(id)
);
CREATE TABLE public.whisper_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  whisper_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT whisper_replies_pkey PRIMARY KEY (id),
  CONSTRAINT whisper_replies_whisper_id_fkey FOREIGN KEY (whisper_id) REFERENCES public.whispers(id),
  CONSTRAINT whisper_replies_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.whispers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  area_name text NOT NULL DEFAULT ''::text,
  location USER-DEFINED,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + '24:00:00'::interval),
  CONSTRAINT whispers_pkey PRIMARY KEY (id),
  CONSTRAINT whispers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);