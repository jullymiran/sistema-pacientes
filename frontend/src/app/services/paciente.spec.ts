import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Paciente } from '../models/paciente';
import { PacienteService } from './paciente';

describe('PacienteService', () => {
  let service: PacienteService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/pacientes';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PacienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar pacientes convertidos em instâncias da classe Paciente', () => {
    service.listar().subscribe((lista) => {
      expect(lista.length).toBe(1);
      expect(lista[0]).toBeInstanceOf(Paciente);
      expect(lista[0].nome).toBe('Ana');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 1,
        nome: 'Ana',
        cpf: '0987767676',
        dataNascimento: '2000-05-20',
        telefone: '1198345678',
        plano: 'Bradesco',
      },
    ]);
  });

  it('deve criar um novo paciente via POST', () => {
    const payload = {
      nome: 'Carlos',
      cpf: '11122233344',
      dataNascimento: '1995-03-10',
      telefone: '11988887777',
      plano: 'SUS',
    };

    service.criar(payload).subscribe((criado) => {
      expect(criado).toBeInstanceOf(Paciente);
      expect(criado.id).toBe(3);
      expect(criado.nome).toBe('Carlos');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 3, ...payload });
  });

  it('deve atualizar um paciente via PUT', () => {
    const payload = {
      nome: 'Ana Paula',
      cpf: '0987767676',
      dataNascimento: '2000-05-20',
      telefone: '1198345678',
      plano: 'Unimed',
    };

    service.atualizar(1, payload).subscribe((atualizado) => {
      expect(atualizado.nome).toBe('Ana Paula');
      expect(atualizado.plano).toBe('Unimed');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 1, ...payload });
  });

  it('deve excluir um paciente via DELETE', () => {
    let concluido = false;
    service.excluir(1).subscribe(() => {
      concluido = true;
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(concluido).toBe(true);
  });
});
