const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Paciente = require('./paciente');

const JWT_SECRET = process.env.JWT_SECRET;


if(!JWT_SECRET) {
    throw new Error('Defina a variável de ambiente JWT_SECRET antes de iniciar o servidor.');
}


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const usuarios = [
   { id: 1, nome: 'Ana', cpf: '09877676761', senhaHash: bcrypt.hashSync('ana123', 10) },
    { id: 1, nome: 'João', cpf: '12345678910', senhaHash: bcrypt.hashSync('jota002', 10) }
]

const pacientes = [
    new Paciente(1, "Ana", "09877676761", "2000-05-20", "1198345678", "Bradesco"),

    new Paciente(2, "João", "12345678910", "2000-06-12", "1393458792", "Unimed")

];

let proximoId = 3;


app.get('/pacientes', autenticar, (req, res) => {
    res.json(pacientes)
});

app.post('/pacientes', autenticar, (req, res) => {
   
   try{
    const {nome, cpf, dataNascimento, telefone, plano} = req.body;

   

    const novo = new Paciente(
        proximoId,
        nome,
        cpf,
        dataNascimento,
        telefone,
        plano
  );
    proximoId++;
    pacientes.push(novo);
    res.status(201).json(novo);

   
  } 
  catch(erro) {
    res.status(400).json({
            erro: erro.message
        });
    
  }
});

app.get('/pacientes/:id', autenticar, (req, res) => {
    const id = Number(req.params.id);
    const paciente = pacientes.find((e) => e.id === id);

    if(!paciente) {
        return res.status(404).json({
            erro: 'Paciente não encontrado'
        });
    }
    res.json(paciente);
});

app.put('/pacientes/:id', autenticar, (req, res) => {
    const id = Number(req.params.id);
    const paciente = pacientes.find((p) => p.id === id);

    if(!paciente){
        return res.status(404).json({
            erro: 'Paciente não encontrado'
        });
    }

    try{
    const {nome, cpf, dataNascimento, telefone, plano} = req.body;
  
    paciente.nome = nome;
    paciente.cpf = cpf ;
    paciente.dataNascimento = dataNascimento;
    paciente.telefone = telefone;
    paciente.plano = plano;

    res.json(paciente);

  } 
  catch(erro) {
    res.status(400).json({
            erro: erro.message
        });
    
  }
});

app.delete('/pacientes/:id', autenticar, (req, res) => {
    const id = Number(req.params.id);
    const indice = pacientes.findIndex((e) => e.id === id);

    if(indice === -1){
        return res.status(404).json({
            erro: 'Paciente não encontrado'
        });
    }

    pacientes.splice(indice, 1);
    res.status(204).send();
});


app.post('/login', async (req, res) => {
    const {cpf, senha} = req.body || {};
    const usuario = usuarios.find((u) => u.cpf === cpf);

    const ok = usuario && (await bcrypt.compare(senha || '', usuario.senhaHash));
    if(!ok){
        return res.status(401).json({erro: 'Credenciais inválidas'});
    }

    const token = jwt.sign(
        {sub: usuario.id }, JWT_SECRET, {expiresIn: '1h'}
    );
    res.json({token});
})

function autenticar(req, res, next) {
    const cab = req.headers.authorization || '';
    const [tipo, token] = cab.split(' ');
    if (tipo !== 'Bearer' || !token) {
        return res.status(401).json({erro: 'Token ausente'});
    }
    try{
        req.usuario = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({erro: 'Token inválido ou expirado'});
    }
}

if(require.main === module) {
    app.listen(PORT, (erro) => {
    
        if (erro) {
            console.error('Não foi possível iniciar o servidor:', erro.message);
        return;
    }
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
}

module.exports = app;