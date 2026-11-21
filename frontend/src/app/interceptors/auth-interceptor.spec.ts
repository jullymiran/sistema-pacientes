import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('deve anexar o cabeçalho Authorization Bearer quando houver token salvo', () => {
    localStorage.setItem('sistema_pacientes_token', 'meu-jwt-123');

    http.get('http://localhost:3000/pacientes').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/pacientes');
    expect(req.request.headers.get('Authorization')).toBe('Bearer meu-jwt-123');
    req.flush([]);
  });

  it('não deve enviar cabeçalho Authorization quando não houver token', () => {
    http.get('http://localhost:3000/pacientes').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/pacientes');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('deve fazer logout e redirecionar para /login ao receber erro 401 em rota protegida', () => {
    localStorage.setItem('sistema_pacientes_token', 'token-expirado');
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get('http://localhost:3000/pacientes').subscribe({
      error: (err) => {
        expect(err.status).toBe(401);
      },
    });

    const req = httpMock.expectOne('http://localhost:3000/pacientes');
    req.flush(
      { erro: 'Token inválido ou expirado' },
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(authService.obterToken()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
