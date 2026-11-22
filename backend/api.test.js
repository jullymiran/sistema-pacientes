process.env.JWT_SECRET = 'segredo-de-teste'; 

const request = require('supertest');
const app = require('./server');

// Usuário pré-cadastrado no server.js 
const CPF = '09877676761';
const SENHA = 'ana123';

// Dados de um paciente novo, usado no POST e no PUT
const dadosEva = {
  nome: 'Eva Costa',
  cpf: '55566677788',
  dataNascimento: '1995-03-20',
  telefone: '11999990005',
  plano: 'Unimed'
};

let token;
let idCriado;

// Faz o login uma vez e guarda o token
beforeAll(async () => {
  const res = await request(app)
    .post('/login')
    .send({ cpf: CPF, senha: SENHA });
  token = res.body.token;
});

describe('Login', () => {
  test('senha errada devolve 401', async () => {
    const res = await request(app)
      .post('/login')
      .send({ cpf: CPF, senha: 'errada' });
    expect(res.status).toBe(401);
    expect(res.body.erro).toBe('Credenciais inválidas');
  });

  test('CPF inexistente devolve 401', async () => {
    const res = await request(app)
      .post('/login')
      .send({ cpf: '00000000000', senha: SENHA });
    expect(res.status).toBe(401);
  });

  test('login sem corpo devolve 401', async () => {
    const res = await request(app).post('/login');
    expect(res.status).toBe(401);
  });

  test('login correto devolve 200 e um token', async () => {
    const res = await request(app)
      .post('/login')
      .send({ cpf: CPF, senha: SENHA });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
  });
});

describe('Proteção das rotas (401)', () => {
  // O mesmo teste para as cinco rotas protegidas
  test.each([
    ['GET', '/pacientes'],
    ['POST', '/pacientes'],
    ['GET', '/pacientes/1'],
    ['PUT', '/pacientes/1'],
    ['DELETE', '/pacientes/1']
  ])('%s %s sem token devolve 401', async (metodo, caminho) => {
    const res = await request(app)[metodo.toLowerCase()](caminho);
    expect(res.status).toBe(401);
    expect(res.body.erro).toBe('Token ausente');
  });

  test('token inválido devolve 401', async () => {
    const res = await request(app)
      .get('/pacientes')
      .set('Authorization', 'Bearer abc.def.ghi');
    expect(res.status).toBe(401);
    expect(res.body.erro).toBe('Token inválido ou expirado');
  });
});

describe('CRUD de pacientes (com token)', () => {
  test('GET /pacientes devolve a lista', async () => {
    const res = await request(app)
      .get('/pacientes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('nome');
    expect(res.body[0]).not.toHaveProperty('_nome');
  });

  test('POST sem o nome devolve 400', async () => {
    const { nome, ...semNome } = dadosEva;
    const res = await request(app)
      .post('/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send(semNome);
    expect(res.status).toBe(400);
    expect(res.body.erro).toMatch(/nome/i);
  });

  test('POST cria um paciente (201)', async () => {
    const res = await request(app)
      .post('/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send(dadosEva);
    expect(res.status).toBe(201);
    expect(res.body.nome).toBe('Eva Costa');
    expect(typeof res.body.id).toBe('number');
    expect(typeof res.body.idade).toBe('number');
    idCriado = res.body.id;
  });

  test('GET /pacientes/:id devolve o paciente criado', async () => {
    const res = await request(app)
      .get(`/pacientes/${idCriado}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Eva Costa');
  });

  test('GET de um id que não existe devolve 404', async () => {
    const res = await request(app)
      .get('/pacientes/99999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.erro).toBe('Paciente não encontrado');
  });

  test('PUT atualiza o paciente', async () => {
    const res = await request(app)
      .put(`/pacientes/${idCriado}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...dadosEva, nome: 'Eva Souza' });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Eva Souza');
  });

  test('PUT de um id que não existe devolve 404', async () => {
    const res = await request(app)
      .put('/pacientes/99999')
      .set('Authorization', `Bearer ${token}`)
      .send(dadosEva);
    expect(res.status).toBe(404);
  });

  test('DELETE remove o paciente (204)', async () => {
    const res = await request(app)
      .delete(`/pacientes/${idCriado}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  test('DELETE do mesmo id de novo devolve 404', async () => {
    const res = await request(app)
      .delete(`/pacientes/${idCriado}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});