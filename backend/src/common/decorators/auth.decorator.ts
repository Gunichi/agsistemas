import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const REQUIRE_AUTH = 'requireAuth';

export const RequireAuth = () => SetMetadata(REQUIRE_AUTH, true);
