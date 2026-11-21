import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient()],
    });
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve permitir o acesso quando o usuário estiver autenticado', () => {
    localStorage.setItem('sistema_pacientes_token', 'token-valido');

    const resultado = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(resultado).toBe(true);
  });

  it('deve redirecionar para /login quando não houver token', () => {
    const resultado = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(resultado).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(resultado as UrlTree)).toBe('/login');
  });
});
