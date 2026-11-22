const Paciente = require('./paciente');

// Cria um paciente válido
function novoPaciente(mudancas = {}) {
  const d = {
    id: 1,
    nome: 'Ana',
    cpf: '11122233344',
    dataNascimento: '2000-05-20',
    telefone: '11987654321',
    plano: 'Unimed',
    ...mudancas
  };

  return new Paciente(
    d.id,
    d.nome,
    d.cpf,
    d.dataNascimento,
    d.telefone,
    d.plano
  );
}

describe('Paciente', () => {
  test('cria um paciente válido', () => {
    const p = novoPaciente();
    expect(p.nome).toBe('Ana');
    expect(p.cpf).toBe('11122233344');
    expect(p.plano).toBe('Unimed');
  });

  test('guarda o id como número', () => {
    expect(novoPaciente({ id: '7' }).id).toBe(7);
  });

  test('remove espaços extras do nome', () => {
    expect(novoPaciente({ nome: '  Ana  ' }).nome).toBe('Ana');
  });

  // Um teste para cada campo: se vier vazio, a classe lança erro
  test.each(['id', 'nome', 'cpf', 'dataNascimento', 'telefone', 'plano'])(
    'rejeita o campo %s vazio',
    (campo) => {
      expect(() => novoPaciente({ [campo]: '   ' })).toThrow(`Campo ${campo}`);
    }
  );

  test('o setter valida depois da criação e mantém o valor antigo', () => {
    const p = novoPaciente();
    expect(() => {
      p.nome = '';
    }).toThrow('Campo nome');
    expect(p.nome).toBe('Ana');
  });

  test('calcularIdade devolve o ano atual menos o ano de nascimento', () => {
    const esperado = new Date().getFullYear() - 2000;
    expect(novoPaciente().calcularIdade()).toBe(esperado);
  });

  test('toJSON usa os nomes públicos, sem o _', () => {
    const json = novoPaciente().toJSON();
    expect(json.nome).toBe('Ana');
    expect(json).not.toHaveProperty('_nome');
  });

  test('toJSON formata o CPF e o telefone de celular', () => {
    const json = novoPaciente().toJSON();
    expect(json.cpf).toBe('111.222.333-44');
    expect(json.telefone).toBe('(11) 98765-4321');
  });

  test('toJSON formata o telefone fixo (10 digitos', () => {
    const json = novoPaciente({ telefone: '1133334444' }).toJSON();
    expect(json.telefone).toBe('(11) 3333-4444');
  });

  test('toJSON mantém o valor quando o tamanho não permite formatar', () => {
    expect(json.cpf).toBe('123');
    expect(json.telefone).toBe('999');
  });

  test('JSON.stringify usa o toJSON e inclui a idade', () => {
    const objeto = JSON.parse(JSON.stringify(novoPaciente()));
    expect(objeto.nome).toBe('Ana');
    expect(typeof objeto.idade).toBe('number');
    expect(objeto).not.toHaveProperty('_cpf');
  });
});
