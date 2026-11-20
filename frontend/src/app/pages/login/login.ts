import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly carregando = signal(false);
  readonly erro = signal('');

  readonly form = this.fb.nonNullable.group({
    cpf: ['', [Validators.required]],
    senha: ['', [Validators.required]],
  });

  entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('Preencha o CPF e a senha para entrar.');
      return;
    }

    this.carregando.set(true);
    this.erro.set('');

    const { cpf, senha } = this.form.getRawValue();

    this.authService.login(cpf.trim(), senha).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/pacientes']);
      },
      error: (err) => {
        this.carregando.set(false);
        if (err.status === 0) {
          this.erro.set(
            'Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3000.'
          );
        } else {
          this.erro.set(err.error?.erro || 'Credenciais inválidas.');
        }
      },
    });
  }
}