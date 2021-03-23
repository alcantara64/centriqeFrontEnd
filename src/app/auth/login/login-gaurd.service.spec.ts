import { TestBed, getTestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../auth.service';
import { LoginGuardService } from './login-guard.service';

describe('LoginGuard', () => {
    let injector: TestBed;
    let authService: AuthService
    let loginGuard: LoginGuardService;
    let routerMock = {navigate: jasmine.createSpy('navigate')}
    const authMock = jasmine.createSpyObj('AuthService', ['AuthService']);

  
    beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoginGuardService, 
        { provide: Router, useValue: routerMock },
      ],
      imports: [HttpClientTestingModule]
    });
    injector = getTestBed();
    authService = injector.get(AuthService);
    loginGuard = injector.get(LoginGuardService);
  });
  
    it('should be created', () => {
      expect(loginGuard).toBeTruthy();
    });
    
    it('should return value', async () => {
    // spyOn(authService, 'isUserAuthenticated').and.returnValue(true);
    // expect(authService.isUserAuthenticated).toEqual(true);
    // // const selected = !await authService.isUserAuthenticated(); // get the promise value
    // //  * assert
    // // expect(selected).toBe(true);
  
    // // await authService.isUserAuthenticated.and.returnValue(true);
    //     const selected = authService.AuthService(); // get the promise value
    //     expect(selected).toBe(false);
    const result = await loginGuard.canActivate();
    expect(result).toBe(true);
  });

    it('should return promise', async ()=> {
      expect(authService.isUserAuthenticated).toBeDefined();
      authMock.AuthService.and.returnValue(false);
      const result = await loginGuard.canActivate();
      expect(result).toEqual(true);
  });
  
  });