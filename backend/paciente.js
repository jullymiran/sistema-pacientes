function  formatarCpf(valor) {
	const d = String(valor).replace(/\D/g, '');
	if(d.length !== 11)
		return valor;
	return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarTelefone(valor) {
	const d = String(valor).replace(/\D/g, '');
	if(d.length === 11)
		return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
	if(d.length === 10)
		return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
	return valor;
}

class Paciente {
constructor (id, nome, cpf, dataNascimento, telefone, plano) {
this.id = id;
this.nome = nome;
this.cpf = cpf;
this.dataNascimento = dataNascimento;
this.telefone = telefone;
this.plano = plano;
}

//método privado para validar os campos
 #validarCampos(v, nomeCampo) {
 if(v === undefined || v === null || String(v).trim() === "")
 {
 throw new Error(`Campo ${nomeCampo} Obrigatório. Preencha com as informações solicitadas.`)
 }
 }

//Métodos, get e set

get id() {
return this._id
}
set id(v) {
	this.#validarCampos(v,'id')
this._id = Number(v);
}

get nome() {
return this._nome
}
set nome(v) {
this.#validarCampos(v,'nome')
this._nome = String(v).trim();
}

get cpf() {
return this._cpf
}
set cpf(v) {
this.#validarCampos(v,'cpf')
this._cpf = String(v).trim();
}

get dataNascimento() {
return this._dataNascimento
}
set dataNascimento(v) {
this.#validarCampos(v,'dataNascimento')
this._dataNascimento = String(v).trim();
}

get telefone() {
return this._telefone
}
set telefone(v) {
this.#validarCampos(v,'telefone')
this._telefone = String(v).trim();
}

get plano() {
return this._plano
}
set plano(v) {
this.#validarCampos(v,'plano')
this._plano = String(v).trim()
}

//Calcular idade do paciente a partir do seu ano de nascimento
calcularIdade() {
const anoAtual = new Date().getFullYear(); //Puxa o ano atual
const anoNascimento = Number(this._dataNascimento.split('-')[0]); 

return anoAtual - anoNascimento;
}

toJSON() {
	return {
		id: this.id,
		nome: this.nome,
		cpf: formatarCpf(this.cpf),
		dataNascimento: this.dataNascimento,
		telefone: formatarTelefone(this.telefone),
		plano: this.plano,
		idade: this.calcularIdade()
	};
}


}

module.exports = Paciente;
