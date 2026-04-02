-- Drift bottle schema aligned with apps/mobile/src/features/drift-bottle/types.ts
-- Bottle: id, content, mood, author (derived from author_id vs auth.uid()), replies[], createdAt
-- Supabase Auth: RLS below uses auth.uid(). If you only use Clerk + Nest, apply the same DDL in SQL Editor
-- then access tables with the service role key from the API (RLS bypassed), after validating the user server-side.

-- Mood labels match frontend union: Calm | Confused | Anxious | Hopeful
CREATE TYPE public.bottle_mood AS ENUM (
  'Calm',
  'Confused',
  'Anxious',
  'Hopeful'
);

CREATE TABLE public.bottles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  content text NOT NULL,
  mood public.bottle_mood NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bottles_content_length CHECK (
    char_length(content) <= 200 AND char_length(trim(content)) > 0
  )
);

COMMENT ON TABLE public.bottles IS 'User-thrown bottles; UI "author: me|stranger" = author_id = auth.uid() or not.';

CREATE TABLE public.bottle_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bottle_id uuid NOT NULL REFERENCES public.bottles (id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bottle_replies_content_length CHECK (
    char_length(trim(content)) > 0 AND char_length(content) <= 1000
  )
);

COMMENT ON TABLE public.bottle_replies IS 'Replies to a bottle; maps to Bottle.replies: string[] in the app.';

CREATE TABLE public.bottle_favorites (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  bottle_id uuid NOT NULL REFERENCES public.bottles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, bottle_id)
);

COMMENT ON TABLE public.bottle_favorites IS 'Saved bottles per user; maps to favorites list in the app.';

CREATE INDEX bottles_created_at_desc_idx ON public.bottles (created_at DESC);
CREATE INDEX bottles_author_id_idx ON public.bottles (author_id);
CREATE INDEX bottle_replies_bottle_id_created_idx ON public.bottle_replies (bottle_id, created_at ASC);
CREATE INDEX bottle_favorites_user_id_created_idx ON public.bottle_favorites (user_id, created_at DESC);

ALTER TABLE public.bottles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bottle_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bottle_favorites ENABLE ROW LEVEL SECURITY;

-- Authenticated clients (Expo + supabase-js with user JWT)
CREATE POLICY bottles_select_authenticated
  ON public.bottles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY bottles_insert_own
  ON public.bottles
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY bottle_replies_select_authenticated
  ON public.bottle_replies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY bottle_replies_insert_own
  ON public.bottle_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY bottle_favorites_select_own
  ON public.bottle_favorites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY bottle_favorites_insert_own
  ON public.bottle_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY bottle_favorites_delete_own
  ON public.bottle_favorites
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

GRANT USAGE ON TYPE public.bottle_mood TO authenticated;

GRANT SELECT, INSERT ON public.bottles TO authenticated;
GRANT SELECT, INSERT ON public.bottle_replies TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.bottle_favorites TO authenticated;
