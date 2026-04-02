import { SetMetadata } from '@nestjs/common';

/** 跳过后端统一 `{ success, data }` 包装（SSE / 原始流等） */
export const SKIP_TRANSFORM_KEY = 'skipTransform';

export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);
