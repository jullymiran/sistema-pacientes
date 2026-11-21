import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deve realizar login, salvar o token no localStorage e marcar como autenticado', () => {
    service.login('0113456782', '123456').subscribe((res) => {
      expect(res.token).toBe('token-fake-jwt');
    });

    const req = httpMock.expectOne('http://localhost:3000/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ cpf: '0113456782', senha: '123456' });

    req.flush({ token: 'token-fake-jwt' });

    expect(service.obterToken()).toBe('token-fake-jwt');
    expect(service.estaAutenticado()).toBe(true);
  });

  it('deve remover o token ao fazer logout', () => {
    localStorage.setItem('sistema_pacientes_token', 'token-teste');

    service.logout();

    expect(service.obterToken()).toBeNull();
    expect(service.estaAutenticado()).toBe(false);
  });
});