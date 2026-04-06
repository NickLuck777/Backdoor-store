import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT guard that NEVER blocks the request.
 *
 * - If a valid Bearer token is present, populates `req.user` so handlers
 *   can attach the request to a real user (cart key, order owner, etc.).
 * - If no token, an invalid token, or an expired token, lets the request
 *   through with `req.user === undefined` so anonymous flows still work.
 *
 * Use this on routes that must support BOTH anonymous and authenticated
 * users with different behavior — e.g. cart, order creation. Without this
 * guard, marking such routes `@Public()` skips JWT validation entirely
 * and `req.user` is always undefined even with a valid token.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Always let the request continue, regardless of token state.
  handleRequest<TUser = any>(_err: any, user: any): TUser {
    return user || (undefined as any);
  }
}
