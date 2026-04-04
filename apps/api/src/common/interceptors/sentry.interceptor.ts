import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Sentry');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        // In production with Sentry configured, capture exception here
        if (process.env.SENTRY_DSN) {
          this.logger.error(`[Sentry] Captured: ${err.message}`, err.stack);
          // Sentry.captureException(err); // uncomment when @sentry/node installed
        }
        return throwError(() => err);
      }),
    );
  }
}
