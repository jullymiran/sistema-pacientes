import { Paciente } from './paciente';

describe('Paciente (Model)', () => {
  it('deve criar um paciente aplicando trim nos campos de texto e convertendo id para número', () => {
    const paciente = new Paciente(
      1,
      '  Maria Silva  ',
      ' 12345678900 ',
      '2000-05-20',
      ' 11999998888 ',
      ' Unimed '
    );

    expect(paciente.id).toBe(1);
    expect(paciente.nome).toBe('Maria Silva');
    expect(paciente.cpf).toBe('12345678900');
    expect(paciente.dataNascimento).toBe('2000-05-20');
    expect(paciente.telefone).toBe('11999998888');
    expect(paciente.plano).toBe('Unimed');
  });

  it('deve calcular a idade corretamente a partir do ano de nascimento', () => {
    const paciente = new Paciente(
      1,
      'Ana',
      '0987767676',
      '2000-05-20',
      '1198345678',
      'Bradesco'
    );
    const idadeEsperada = new Date().getFullYear() - 2000;

    expect(paciente.calcularIdade()).toBe(idadeEsperada);
  });

  it('deve instanciar um Paciente a partir de um objeto JSON da API', () => {
    const paciente = Paciente.fromJSON({
      id: 2,
      nome: 'João',
      cpf: '12345670',
      dataNascimento: '2000-06-12',
      telefone: '13934587',
      plano: 'Unimed',
    });

    expect(paciente).toBeInstanceOf(Paciente);
    expect(paciente.id).toBe(2);
    expect(paciente.nome).toBe('João');
  });
});