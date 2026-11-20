export interface PacientePayload {
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  plano: string;
}

export interface PacienteResponse extends PacientePayload {
  id: number;
  idade?: number;
}

export class Paciente {
  private _id!: number;
  private _nome!: string;
  private _cpf!: string;
  private _dataNascimento!: string;
  private _telefone!: string;
  private _plano!: string;

  constructor(
    id: number,
    nome: string,
    cpf: string,
    dataNascimento: string,
    telefone: string,
    plano: string
  ) {
    this.id = id;
    this.nome = nome;
    this.cpf = cpf;
    this.dataNascimento = dataNascimento;
    this.telefone = telefone;
    this.plano = plano;
  }

  get id(): number {
    return this._id;
  }
  set id(valor: number) {
    this._id = Number(valor);
  }

  get nome(): string {
    return this._nome;
  }
  set nome(valor: string) {
    this._nome = valor.trim();
  }

  get cpf(): string {
    return this._cpf;
  }
  set cpf(valor: string) {
    this._cpf = valor.trim();
  }

  get dataNascimento(): string {
    return this._dataNascimento;
  }
  set dataNascimento(valor: string) {
    this._dataNascimento = valor.trim();
  }

  get telefone(): string {
    return this._telefone;
  }
  set telefone(valor: string) {
    this._telefone = valor.trim();
  }

  get plano(): string {
    return this._plano;
  }
  set plano(valor: string) {
    this._plano = valor.trim();
  }

  calcularIdade(): number {
    const anoAtual = new Date().getFullYear();
    const anoNascimento = Number(this._dataNascimento.split('-')[0]);
    return anoAtual - anoNascimento;
  }

  static fromJSON(dados: PacienteResponse): Paciente {
    return new Paciente(
      dados.id,
      dados.nome,
      dados.cpf,
      dados.dataNascimento,
      dados.telefone,
      dados.plano
    );
  }
}