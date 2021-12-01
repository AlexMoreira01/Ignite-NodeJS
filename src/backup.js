const { request, response } = require('express');
const express = require('express');

const app = express();

app.use(express.json());

/**
 * GET - Buscar informação dentro do servidor
 * POST - Inserir informação no servidor
 * PUT - Alterar informação no servidor
 * PATCH - Alterar informação especifica
 * DELETE - Deletar informação no servidor
 */

/**
 * Tipos de parâmetros
 * 
 * Routes Params => Identificar um recurso editar/deletar/Buscar   na URL
 * Query Params => Paginação / Filtro
 * Body Params => Os objetos inserçao/alteração (JSON)
 */

app.get("/courses", (request, response) => {
    const query = request.query;
    console.log(query)
    return response.json(["Curso 1", "Curso 2", "Curso 3"]);
})//chamar rota

app.post("/courses", (request, response) =>{
    const body = request.body;
    console.log(body);
    return response.json(["Curso 1", "Curso 2", "Curso 3", "Curso 4"]);
})
// Quando receber o id ira alterar
app.put("/courses/:id", (request, response) =>{
    const { id } = request.params;//Trabalhar com routes Params
    console.log(id)
    return response.json(["Curso 6", "Curso 2", "Curso 3", "Curso 4"]);
})

app.patch("/courses/:id", (request, response) =>{
    return response.json(["Curso 6", "Curso 7", "Curso 3", "Curso 4"]);
})

app.delete("/courses/:id", (request, response) =>{
    return response.json(["Curso 6", "Curso 7", "Curso 4"]);
})

app.listen(3333);//express de o start na aplicaão