import { Component, ChangeDetectionStrategy, computed, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize, startWith } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { UserService } from '../../../core/services/user';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserList implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // Form control for search input
  readonly searchControl = new FormControl('', { nonNullable: true });

  // component state
  private readonly usersSubject = new BehaviorSubject<User[]>([]);
  readonly users$: Observable<User[]> = this.usersSubject.asObservable();
  loading: boolean = true;
  error: string | null = null;

  // Convert search form control to signal with debouncing
  readonly searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  // Computed filtered users based on search term
  readonly filteredUsers = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const allUsers = this.usersSubject.value;
    
    if (!search) {
      return allUsers;
    }

    return allUsers.filter(user =>
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.username.toLowerCase().includes(search)
    );
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  // Loads users from the API and handles the response
  private loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.userService.getUsers().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (users) => {
        this.usersSubject.next(users);
      },
      error: (errorMessage: string) => {
        this.error = errorMessage;
      }
    });
  }

  // Navigates to user detail page
  onUserClick(userId: number): void {
    this.router.navigate(['/users', userId]);
  }

  // Retries loading users when an error occurs
  onRetry(): void {
    this.loadUsers();
  }

  // Clears the search input
  onClearSearch(): void {
    this.searchControl.setValue('');
  }
}
