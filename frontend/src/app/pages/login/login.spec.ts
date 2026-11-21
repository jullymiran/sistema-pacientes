import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Login } from './login';

describe('Login (Integração)', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('deve exibir erro de validação quando o formulário for enviado vazio', () => {
    component.entrar();
    fixture.detectChanges();

    expect(component.erro()).toBe('Preencha o CPF e a senha para entrar.');
    httpMock.expectNone('http://localhost:3000/login');
  });

  it('deve autenticar com credenciais válidas e redirecionar para /pacientes', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.form.setValue({ cpf: '0113456782', senha: '123456' });
    component.entrar();

    const req = httpMock.expectOne('http://localhost:3000/login');
    req.flush({ token: 'jwt-valido' });

    expect(localStorage.getItem('sistema_pacientes_token')).toBe('jwt-valido');
    expect(navigateSpy).toHaveBeenCalledWith(['/pacientes']);
  });

  it('deve exibir mensagem de erro quando as credenciais forem inválidas (401)', () => {
    component.form.setValue({ cpf: '0000000000', senha: 'errada' });
    component.entrar();

    const req = httpMock.expectOne('http://localhost:3000/login');
    req.flush(
      { erro: 'Credenciais inválidas' },
      { status: 401, statusText: 'Unauthorized' }
    );
    fixture.detectChanges();

    const alerta = fixture.nativeElement.querySelector('.alert-error');
    expect(alerta?.textContent).toContain('Credenciais inválidas');
  });
});
