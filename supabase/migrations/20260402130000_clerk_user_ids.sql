-- 后端使用 Clerk 等外部鉴权时，user id 为字符串，与 auth.users(uuid) 外键不兼容：改为 varchar 并去掉外键。

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
