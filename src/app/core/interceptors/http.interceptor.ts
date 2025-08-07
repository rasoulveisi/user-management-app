import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

// Simple HTTP interceptor for adding headers and handling errors
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  // Add common headers to all requests
  const modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'X-App-Version': '1.0.0',
      // Add any other headers you need
    }
  });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log error for debugging
      console.error('HTTP Error:', error);

      // Handle different error types
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Network error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 0:
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
            break;
          case 401:
            errorMessage = 'Unauthorized access. Please login again.';
            break;
          case 403:
            errorMessage = 'Access forbidden. You do not have permission.';
            break;
          case 404:
            errorMessage = 'Resource not found.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Server error (${error.status}): ${error.message || 'Unknown error'}`;
        }
      }

      // Return user-friendly error message
      return throwError(() => errorMessage);
    })
  );
};
