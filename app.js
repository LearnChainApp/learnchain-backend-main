const express = require('express');
const app = express();
require('express-async-errors');
const cors = require('cors');
const mongoose = require('mongoose');
const middleware = require('./utils/middleware');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const contentRouter = require('./controllers/content');
const tokensRouter = require('./controllers/tokens');
const miscRouter = require('./controllers/misc');
const libraryRouter = require('./controllers/library');

mongoose.set('strictQuery', false);
console.log('Conectando ao MongoDB...');
mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('Conectado ao MongoDB');
    })
    .catch((error) => {
        console.error('Erro ao conectar ao MongoDB', error);
    });

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.use('/api/content', middleware.extractToken);
app.use('/api/content', middleware.extractUser);
app.use('/api/content', contentRouter);

app.use('/api/tokens', middleware.extractToken);
app.use('/api/tokens', middleware.extractUser);
app.use('/api/tokens', tokensRouter);

app.use('/api/misc', miscRouter);

app.use('/api/library', middleware.extractToken);
app.use('/api/library', middleware.extractUser);
app.use('/api/library', middleware.filterLoggedIn);
app.use('/api/library', libraryRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
