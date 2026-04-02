-- API / 客户端已不再写入 mood；与 TypeORM Bottle 实体一致（无 mood 列）。
ALTER TABLE public.bottles
  DROP COLUMN IF EXISTS mood;

DROP TYPE IF EXISTS public.bottle_mood;
