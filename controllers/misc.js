const miscRouter = require('express').Router();

miscRouter.get('/stay-alive', async (req, res) => {
    res.status(200).send({ message: 'bee gees' }) //stayin alive
});

module.exports = miscRouter;