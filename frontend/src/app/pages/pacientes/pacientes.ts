import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Paciente, PacientePayload } from '../../models/paciente';
import { AuthService } from '../../services/auth';
import { PacienteService } from '../../services/paciente';

@Component({
  selector: 'app-pacientes',
  imports: [ReactiveFormsModule],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css',
})
export class Pacientes implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly pacienteService = inject(PacienteService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly pacientes = signal<Paciente[]>([]);
  readonly filtro = signal('');
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly editandoId = signal<number | null>(null);
  readonly erro = signal('');
  readonly sucesso = signal('');

  readonly pacientesFiltrados = computed(() => {
    const termo = this.filtro().trim().toLowerCase();
    if (!termo) {
      return this.pacientes();
    }
    return this.pacientes().filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.cpf.toLowerCase().includes(termo) ||
        p.plano.toLowerCase().includes(termo)
    );
  });

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required]],
    cpf: ['', [Validators.required]],
    dataNascimento: ['', [Validators.required]],
    telefone: ['', [Validators.required]],
    plano: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.carregarPacientes();
  }

  carregarPacientes(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.pacienteService.listar().subscribe({
      next: (lista) => {
        this.pacientes.set(lista);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(
          err.error?.erro || 'Não foi possível carregar a lista de pacientes.'
        );
      },
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('Preencha todos os campos obrigatórios.');
      return;
    }

    const dados: PacientePayload = this.form.getRawValue();
    const idEdicao = this.editandoId();

    this.salvando.set(true);
    this.erro.set('');
    this.sucesso.set('');

    if (idEdicao !== null) {
      this.pacienteService.atualizar(idEdicao, dados).subscribe({
        next: (atualizado) => {
          this.pacientes.update((lista) =>
            lista.map((p) => (p.id === atualizado.id ? atualizado : p))
          );
          this.salvando.set(false);
          this.sucesso.set('Paciente atualizado com sucesso!');
          this.cancelarEdicao();
        },
        error: (err) => {
          this.salvando.set(false);
          this.erro.set(err.error?.erro || 'Erro ao atualizar paciente.');
        },
      });
    } else {
      this.pacienteService.criar(dados).subscribe({
        next: (criado) => {
          this.pacientes.update((lista) => [...lista, criado]);
          this.salvando.set(false);
          this.sucesso.set('Paciente cadastrado com sucesso!');
          this.form.reset();
        },
        error: (err) => {
          this.salvando.set(false);
          this.erro.set(err.error?.erro || 'Erro ao cadastrar paciente.');
        },
      });
    }
  }

  iniciarEdicao(paciente: Paciente): void {
    this.editandoId.set(paciente.id);
    this.erro.set('');
    this.sucesso.set('');
    this.form.setValue({
      nome: paciente.nome,
      cpf: paciente.cpf,
      dataNascimento: paciente.dataNascimento,
      telefone: paciente.telefone,
      plano: paciente.plano,
    });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.form.reset();
  }

  excluir(paciente: Paciente): void {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir o paciente "${paciente.nome}"?`
    );
    if (!confirmou) {
      return;
    }

    this.erro.set('');
    this.sucesso.set('');

    this.pacienteService.excluir(paciente.id).subscribe({
      next: () => {
        this.pacientes.update((lista) =>
          lista.filter((p) => p.id !== paciente.id)
        );
        if (this.editandoId() === paciente.id) {
          this.cancelarEdicao();
        }
        this.sucesso.set('Paciente excluído com sucesso!');
      },
      error: (err) => {
        this.erro.set(err.error?.erro || 'Erro ao excluir paciente.');
      },
    });
  }

  atualizarFiltro(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.filtro.set(input.value);
  }

  formatarData(dataIso: string): string {
    const partes = dataIso.split('-');
    if (partes.length !== 3) {
      return dataIso;
    }
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
