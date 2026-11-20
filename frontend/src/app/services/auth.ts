import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000';
  private readonly tokenKey = 'sistema_pacientes_token';

  readonly autenticado = signal<boolean>(!!this.obterToken());

  login(cpf: string, senha: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { cpf, senha })
      .pipe(
        tap((resposta) => {
          localStorage.setItem(this.tokenKey, resposta.token);
          this.autenticado.set(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.autenticado.set(false);
  }

  obterToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  estaAutenticado(): boolean {
    const possuiToken = !!this.obterToken();
    if (this.autenticado() !== possuiToken) {
      this.autenticado.set(possuiToken);
    }
    return possuiToken;
  }
}
