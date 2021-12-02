const { request, response } = require('express');
const express = require('express');
const { v4: uuidv4 } = require("uuid")

const app = express();

app.use(express.json());//Receber JSON

const customers = [];

//customer aparenta ser os dados dentro de do array customers

//Middlewares == função que fica entre a rota e o request e response == valid token == usuarios adms === next define a execução
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

function getBalance(statement){
    //REcebe dois parametros 1 == acumulador ele armazena o valor ou remove do objeto/ 2== objeto a ser inerado
    const balance =  statement.reduce((acc, operation) => {//Pega informações do valor passado ela ira transformar todos os valores em um somente
        if(operation.type === 'credit'){
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
app.post("/account", (request, response) =>{
    //Pegando cpf e name
    const { cpf, name } = request.body;
    //                                  Busca que retorna true or false de acordo com a condição
    const customerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
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
app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
    //                so precisa ser passado assim e ele ja ira receber o reequest response e next
    const { customer } = request// ter acesso ao customer verificado no middleware
    return response.json(customer.statement);
})

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

app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
    const { amount } = request.body;//Quantia do saque
    const { customer } = request;//Pegar as infos do quanto se tem em conta

    const balance = getBalance(customer.statement);

    if(balance < amount){
        return response.status(400).json({error: "Insufficient funds"})
    }

    const statementOperation = {
        
    }
})

app.listen(3333);//express de o start na aplicaão

