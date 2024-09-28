
const requestLogger = (req, res, next) => {
    console.log('Method: ', req.method);
    console.log('Path: ', req.path);
    console.log('Body: ', req.body);
    console.log('-------');
    next();
}

const unknownEndpoint = (req, res) => {
    response.status(404).send({ error: 'Unknown endpoint' });
}

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(400).json({ error: 'invalid token' })
    }

    next(error)
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler
}