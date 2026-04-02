-- 后端使用 Clerk 等外部鉴权时，user id 为字符串，与 auth.users(uuid) 外键不兼容：改为 varchar 并去掉外键。
-- 须先删除引用这些列的 RLS 策略，否则 ALTER TYPE 会报 “cannot alter type of a column used in a policy definition”。

DROP POLICY IF EXISTS bottles_insert_own ON public.bottles;
DROP POLICY IF EXISTS bottle_replies_insert_own ON public.bottle_replies;
DROP POLICY IF EXISTS bottle_favorites_select_own ON public.bottle_favorites;
DROP POLICY IF EXISTS bottle_favorites_insert_own ON public.bottle_favorites;
DROP POLICY IF EXISTS bottle_favorites_delete_own ON public.bottle_favorites;

ALTER TABLE bottle_replies
  DROP CONSTRAINT IF EXISTS bottle_replies_author_id_fkey;
ALTER TABLE bottles
  DROP CONSTRAINT IF EXISTS bottles_author_id_fkey;
ALTER TABLE bottle_favorites
  DROP CONSTRAINT IF EXISTS bottle_favorites_user_id_fkey;

ALTER TABLE bottles
  ALTER COLUMN author_id TYPE varchar(128) USING author_id::text;
ALTER TABLE bottle_replies
  ALTER COLUMN author_id TYPE varchar(128) USING author_id::text;
ALTER TABLE bottle_favorites
  ALTER COLUMN user_id TYPE varchar(128) USING user_id::text;

-- 仅保留与列类型无关的策略（如 bottles_select_authenticated）。写入请走 Nest + service role 或后续自定义 JWT 策略。
