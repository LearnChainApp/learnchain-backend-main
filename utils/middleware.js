const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requestLogger = (req, res, next) => {
    console.log('Method: ', req.method);
    console.log('Path: ', req.path);
    console.log('Body: ', req.body);
    console.log('-------');
    next();
};

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'Unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message });
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(400).json({ error: 'invalid login token' });
    } else if (error.name === 'AxiosError') {
        return response.status(error.response.status).send({ error: 'try verifying your signature' });
    }

    response.status(500).send({ error: 'unknown server error' })
    next(error);
};

const extractToken = (req, res, next) => {
    const authorization = req.get('authorization');
    if (authorization && authorization.startsWith('Bearer ')) {
        req.token = authorization.replace('Bearer ', '');
    }
    next();
};

const extractUser = async (req, res, next) => {
    if (req.token !== undefined) {
        const decodedToken = jwt.verify(req.token, process.env.SECRET);
        req.user = await User.findById(decodedToken.id);
    }
    next();
};

const filterLoggedIn = async (req, res, next) => {
    if (req.user !== undefined) next();
    else res.status(403).send({ error: 'not logged in.' });
};

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    extractToken,
    extractUser,
    filterLoggedIn,
};
