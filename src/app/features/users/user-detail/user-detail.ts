import { Component, ChangeDetectionStrategy, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';

import { UserService } from '../../../core/services/user';
import { User } from '../../../core/models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './user-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);

  // component state
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  readonly user$: Observable<User | null> = this.userSubject.asObservable();
  loading: boolean = true;
  error: string | null = null;

  // Get user ID from route parameters
  private readonly userId = toSignal(
    this.route.params.pipe(
      switchMap(params => [+params['id']])
    ),
    { initialValue: 0 }
  );

  ngOnInit(): void {
    const id = this.userId();
    if (id && id > 0) {
      this.loadUser(id);
    } else {
      this.error = 'Invalid user ID';
      this.loading = false;
    }
  }

  // Loads user details from the API
  private loadUser(userId: number): void {
    this.loading = true;
    this.error = null;

    this.userService
      .getUserById(userId)
      .subscribe({
        next: (user) => {
          this.userSubject.next(user);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (errorMessage: string) => {
          this.error = errorMessage;
          this.loading = false;
          this.cdr.detectChanges();
        },
        complete: () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  // Navigates back to the user list
  onBackToList(): void {
    this.router.navigate(['/users']);
  }

  // Retries loading user details when an error occurs
  onRetry(): void {
    const id = this.userId();
    if (id && id > 0) {
      this.loadUser(id);
    }
  }
}
