const { request, response } = require('express');
const express = require('express');
const { v4: uuidv4, validate } = require("uuid")

const app = express();

app.use(express.json());//Receber JSON

const customers = [];

//customer aparenta ser os dados dentro de do array customers

//Middlewares == função que fica entre a rota e o request e response == valid token == usuarios adms === next define a execução
//Middleware Verifica conta existente
function verifyIfExistsAccountCPF(request, response, next) {
    const { cpf } = request.headers;//pegando atravez dos headers

    // customer vai percorrer o array customers e procurar se tem algum customer com cpf
    const customer = customers.find(customer => customer.cpf === cpf);//customer dentro da arrow é como se fosse as infos do array

    if(!customer){
        return response.status(400).json({error: "Customer nor found"});
    }

    //Passar o costumer para as demais rotas 
    request.customer = customer// todos os middlewares que chamarem a function teram acesso a esse customer

    return next();

    //se nao existir um costumer ele ira dar erro, caso exista ele ira retornar next
}
//Middeleware para verificar se é possivel retirar ou adicionar extrato
function getBalance(statement){
    //REcebe dois parametros 1 == acumulador ele armazena o valor ou remove do objeto/ 2== objeto a ser inerado
    const balance =  statement.reduce((acc, operation) => {//Pega informações do valor passado ela ira transformar todos os valores em um somente
        if(operation.type === 'credit'){//Sempre q incrementar adiciona a balance
            return acc + operation.amount;
        }else{
            return acc - operation.amount;
        }
    }, 0)//Qual valor o reduce vai ser iniciado que é o valor inicial passado

    return balance;
}

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement []
 */
//Criando Conta 
app.post("/account", (request, response) =>{
    //Pegando cpf e name
    const { cpf, name } = request.body;
    //                                  Busca que retorna true or false de acordo com a condição
    const customerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
        //retorna customer
    );

    if(customerAlreadyExists){
        return response.status(400).json({error: "Customer already exists"})
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return response.status(201).send();

})
//Middlewares == se usa assim quando todas as rotas a partir dele iram precisar do serviço
// app.use(verifyIfExistsAccountCPF); // se passado dentro da rota sera para especificar

// app.get("/statement/:cpf", (request, response) => { //route params ira receber cpf
    // const { cpf } = request.params;//pegando cpf de dentro de params
// Buscando Depositos
app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
    //                so precisa ser passado assim e ele ja ira receber o reequest response e next
    const { customer } = request// ter acesso ao customer verificado no middleware
    return response.json(customer.statement);
})

//Fazendo Deposito
app.post("/deposit", verifyIfExistsAccountCPF, (request, response) =>{
    const { description, amount} = request.body; //Trabalhando com post se pega do request.body

    const { customer } = request;

    const statementOperation = {
        description,//vai receber
        amount,
        create_at: new Date(),
        type: 'credit'
    }

    //Esta trabalahndo com o array em memoria e ele pega o a posição de acordo com o custumer e inseri
    //inserir statementOperation no costumer
    customer.statement.push(statementOperation);

    return response.status(201).send();

})

//Fazendo um saque                                   receber
app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
    const { amount } = request.body;//Quantia do saque    vai receber eesse valor
    const { customer } = request;//Pegar as infos do quanto se tem em conta

    const balance = getBalance(customer.statement);//Passando dados

    if(balance < amount){
        return response.status(400).json({error: "Insufficient funds"})
    }

    const statementOperation = {
        amount,
        create_at: new Date(),
        type: 'debit'
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
})

//Buscando um deposito por data / Query params
app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) => {
    //                so precisa ser passado assim e ele ja ira receber o reequest response e next
    const { customer } = request// ter acesso ao customer verificado no middleware
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00"); //Qualquer horario  do dia

                                     //Retorne os statements     a data do statement q for igual a essa data que acabou de ser passada
    const statement = customer.statement.filter(
        (statement) => 
            statement.create_at.toDateString() === new Date(dateFormat).toDateString()
    );//Fazendo um filtro para ele retornar apenas o extrato do dia
                                   
    return response.json(statement);
})

//Atualizar os dados do Cliente   arrow function que recebe request e response
app.put("/account", verifyIfExistsAccountCPF, (request, response) =>{
    const { name } = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send();
});

//Obter dados da conta
app.get("/account", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;

    return response.json(customer)
});

//Delete Conta
app.delete("/account", verifyIfExistsAccountCPF, (request, response) =>{
    const { customer } = request;

    // splice  espera um array / 1 parametro inicia em customer a remoção / 2 parametro é ate onde deve ser feita a remoção
    customers.splice(customer, 1)//Valor 1 do array que é o selecionado

    return response.status(200).json(customers);
});

//Retorno balance
app.get("/balance", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;

    const balance = getBalance(customer.statement);

    return response.json(balance);
})

app.listen(3333);//express de o start na aplicaão

