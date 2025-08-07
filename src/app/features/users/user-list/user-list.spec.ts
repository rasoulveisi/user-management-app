import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { UserList } from './user-list';
import { UserService } from '../../../core/services/user';
import { User } from '../../../core/models/user.model';

describe('UserList', () => {
  let component: UserList;
  let fixture: ComponentFixture<UserList>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockRouter: jasmine.SpyObj<Router>;


  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['getUsers']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockUserService.getUsers.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [UserList],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserList);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call loadUsers on initialization', () => {
      spyOn(component as any, 'loadUsers').and.callThrough();
      component.ngOnInit();
      expect((component as any).loadUsers).toHaveBeenCalled();
    });
  });

  describe('loadUsers', () => {
    const mockUsers: User[] = [
      { id: 1, name: 'John Doe', username: 'johndoe', email: 'john@example.com', phone: '123-456-7890', website: 'john.com', address: { street: '', suite: '', city: '', zipcode: '', geo: { lat: '', lng: '' } }, company: { name: '', catchPhrase: '', bs: '' } },
      { id: 2, name: 'Jane Smith', username: 'janesmith', email: 'jane@example.com', phone: '987-654-3210', website: 'jane.com', address: { street: '', suite: '', city: '', zipcode: '', geo: { lat: '', lng: '' } }, company: { name: '', catchPhrase: '', bs: '' } }
    ];

    it('should update usersSubject with fetched users on success', (done) => {
      mockUserService.getUsers.and.returnValue(new BehaviorSubject(mockUsers).asObservable());
      (component as any).loadUsers();
      component.users$.subscribe(users => {
        expect(users).toEqual(mockUsers);
        done();
      });
    });

    it('should set error message on fetch failure', (done) => {
      const errorMessage = 'Failed to load users';
      mockUserService.getUsers.and.returnValue(new Observable(observer => {
        observer.error(errorMessage);
      }));
      (component as any).loadUsers();
      setTimeout(() => {
        expect(component.error).toBe(errorMessage);
        expect(component.loading).toBeFalse();
        done();
      }, 100);
    });
  });


  describe('onUserClick', () => {
    it('should navigate to user detail page with correct user ID', () => {
      const userId = 1;
      component.onUserClick(userId);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/users', userId]);
    });
  });
});