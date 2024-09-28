const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const middleware = require('./utils/middleware');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');

mongoose.set('strictQuery', false);
console.log("Conectando ao MongoDB");
//Lembre-se de configurar as variáveis de ambiente.
mongoose.connect(process.env.MONGODB_URL)
  .then(() => { console.log("Conectado ao MongoDB") })
  .catch((error) => { console.error('Erro ao conectar ao MongoDB', error) });

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;