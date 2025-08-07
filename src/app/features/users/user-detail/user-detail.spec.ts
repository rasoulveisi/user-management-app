import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { UserDetail } from './user-detail';
import { UserService } from '../../../core/services/user';
import { User } from '../../../core/models/user.model';

describe('UserDetail', () => {
  let component: UserDetail;
  let fixture: ComponentFixture<UserDetail>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: jasmine.SpyObj<ActivatedRoute>;

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    address: {
      street: '123 Main St',
      suite: 'Apt 1',
      city: 'Anytown',
      zipcode: '12345',
      geo: { lat: '40.7128', lng: '-74.0060' }
    },
    phone: '1-555-123-4567 x1234',
    website: 'john.example.com',
    company: {
      name: 'Tech Corp',
      catchPhrase: 'Innovative solutions',
      bs: 'technology'
    }
  };

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['getUserById']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      params: of({ id: '1' })
    });

    await TestBed.configureTestingModule({
      imports: [UserDetail],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetail);
    component = fixture.componentInstance;
    mockUserService.getUserById.and.returnValue(of(mockUser));
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load user on init with valid ID', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      
      // Subscribe to user$ to verify the data
      component.user$.subscribe(user => {
        expect(user).toEqual(mockUser);
      });
      
      expect(component.loading).toBe(false);
      expect(component.error).toBe(null);
    });
  });

  describe('Navigation', () => {
    it('should navigate back to users list when onBackToList is called', () => {
      component.onBackToList();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/users']);
    });
  });

  describe('Error Handling', () => {
    it('should retry loading user when onRetry is called', () => {
      // Reset the spy to check if it's called again
      mockUserService.getUserById.calls.reset();
      
      // Set initial state
      component.loading = false;
      
      component.onRetry();
      
      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(component.loading).toBe(false);
    });
  });

  describe('Observable Properties', () => {
    it('should expose user$ as Observable', () => {
      expect(component.user$).toBeDefined();
      expect(typeof component.user$.subscribe).toBe('function');
    });

    it('should emit user when data is loaded', (done) => {
      // Subscribe first, then trigger ngOnInit
      component.user$.subscribe(user => {
        if (user) {
          expect(user).toEqual(mockUser);
          done();
        }
      });
      
      // Trigger the data load
      fixture.detectChanges();
    });
  });

  describe('Signal State Management', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should update loading and error states when user loads successfully', () => {
      expect(component.loading).toBe(false);
      expect(component.error).toBe(null);
    });
  });
});