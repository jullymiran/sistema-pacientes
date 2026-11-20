import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  Paciente,
  PacientePayload,
  PacienteResponse,
} from '../models/paciente';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/pacientes';

  listar(): Observable<Paciente[]> {
    return this.http
      .get<PacienteResponse[]>(this.apiUrl)
      .pipe(map((lista) => lista.map((item) => Paciente.fromJSON(item))));
  }

  buscarPorId(id: number): Observable<Paciente> {
    return this.http
      .get<PacienteResponse>(`${this.apiUrl}/${id}`)
      .pipe(map((item) => Paciente.fromJSON(item)));
  }

  criar(dados: PacientePayload): Observable<Paciente> {
    return this.http
      .post<PacienteResponse>(this.apiUrl, dados)
      .pipe(map((item) => Paciente.fromJSON(item)));
  }

  atualizar(id: number, dados: PacientePayload): Observable<Paciente> {
    return this.http
      .put<PacienteResponse>(`${this.apiUrl}/${id}`, dados)
      .pipe(map((item) => Paciente.fromJSON(item)));
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}