const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require('uuidv4');

// const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequests(req, res, next) {
  const { method, url } = req;

  const logLabel = `[${method.toUpperCase()}] ${url}`

  console.time(logLabel);

  next(); // chamada do próximo middleware -> rotas

  console.timeEnd(logLabel);
}

function validadeProjectId(req, res, next) {
  const { id } = req.params;

  if (!isUuid(id)) {
    return res.status(400).json({ error: "Invalid project ID"});
  }

  return next();
}

app.use(logRequests);
app.use('/repositories/:id', validadeProjectId);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const {title, url, techs} = request.body;

  if (title === undefined || url === undefined | techs === undefined) {
    return response.status().json({ error: "title, url and techs are required to create a repository" });
  }

  const repository = {
    id: uuid(), title, url, techs, likes: 0
  }

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const {id} = request.params;
  const {title, url, techs} = request.body;

  const repoIndex = repositories.findIndex( repositorie => repositorie.id === id);

  if (repoIndex < 0) {
    return response.status(400).json({ error: "repository ID does not exists" });
  }

  const repository = repositories[repoIndex];
    repository.title= title? title :repository.title;
    repository.url= url? url :repository.url;
    repository.techs= techs? techs :repository.techs;

  repositories[repoIndex]= repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const {id} = request.params;

  const repoIndex = repositories.findIndex( repositorie => repositorie.id === id);

  if (repoIndex < 0) {
    return response.status(400).json({ error: "repository ID does not exists" });
  }

  repositories.splice(repoIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const {id} = request.params;

  const repoIndex = repositories.findIndex( repositorie => repositorie.id === id);

  if (repoIndex < 0) {
    return response.status(400).json({ error: "repository ID does not exists" });
  }

  const repository = repositories[repoIndex];
  repository.likes++;

  repositories[repoIndex]= repository;

  return response.json({ likes: repository.likes });
});

module.exports = app;
