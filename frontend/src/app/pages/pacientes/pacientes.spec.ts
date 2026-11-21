import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Pacientes } from './pacientes';

describe('Pacientes (Integração CRUD)', () => {
  let component: Pacientes;
  let fixture: ComponentFixture<Pacientes>;
  let httpMock: HttpTestingController;
  let router: Router;
  const apiUrl = 'http://localhost:3000/pacientes';

  const listaInicial = [
    {
      id: 1,
      nome: 'Ana',
      cpf: '0987767676',
      dataNascimento: '2000-05-20',
      telefone: '1198345678',
      plano: 'Bradesco',
    },
    {
      id: 2,
      nome: 'João',
      cpf: '12345670',
      dataNascimento: '2000-06-12',
      telefone: '13934587',
      plano: 'Unimed',
    },
  ];

  beforeEach(async () => {
    localStorage.setItem('sistema_pacientes_token', 'token-teste');
    await TestBed.configureTestingModule({
      imports: [Pacientes],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Pacientes);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();

    const reqInit = httpMock.expectOne(apiUrl);
    reqInit.flush(listaInicial);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('deve carregar e exibir os pacientes iniciais na tabela', () => {
    const linhas = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(linhas.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Ana');
    expect(fixture.nativeElement.textContent).toContain('João');
  });

  it('deve cadastrar um novo paciente e adicioná-lo à lista', () => {
    component.form.setValue({
      nome: 'Maria Silva',
      cpf: '09814562520',
      dataNascimento: '2000-02-20',
      telefone: '11999915620',
      plano: 'SUS',
    });

    component.salvar();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({
      id: 3,
      nome: 'Maria Silva',
      cpf: '09814562520',
      dataNascimento: '2000-02-20',
      telefone: '11999915620',
      plano: 'SUS',
    });
    fixture.detectChanges();

    expect(component.pacientes().length).toBe(3);
    expect(component.sucesso()).toBe('Paciente cadastrado com sucesso!');
  });

  it('deve editar um paciente existente e atualizar a lista', () => {
    component.iniciarEdicao(component.pacientes()[0]);
    component.form.patchValue({ plano: 'SulAmérica' });

    component.salvar();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({
      ...listaInicial[0],
      plano: 'SulAmérica',
    });
    fixture.detectChanges();

    expect(component.pacientes()[0].plano).toBe('SulAmérica');
    expect(component.editandoId()).toBeNull();
    expect(component.sucesso()).toBe('Paciente atualizado com sucesso!');
  });

  it('deve excluir um paciente após confirmação e removê-lo da lista', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.excluir(component.pacientes()[1]);

    const req = httpMock.expectOne(`${apiUrl}/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    fixture.detectChanges();

    expect(component.pacientes().length).toBe(1);
    expect(component.sucesso()).toBe('Paciente excluído com sucesso!');
  });

  it('deve filtrar os pacientes por nome ou plano', () => {
    component.filtro.set('Unimed');
    fixture.detectChanges();

    expect(component.pacientesFiltrados().length).toBe(1);
    expect(component.pacientesFiltrados()[0].nome).toBe('João');
  });

  it('deve limpar o token e voltar para /login ao clicar em sair', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.sair();

    expect(localStorage.getItem('sistema_pacientes_token')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
