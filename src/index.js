const { request, response } = require('express');
const express = require('express');
const { v4: uuidv4 } = require("uuid")

const app = express();

const customers = [];

app.use(express.json());//Receber JSON

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

app.listen(3333);//express de o start na aplicaão