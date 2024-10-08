const tokensRouter = require('express').Router();
const middleware = require('../utils/middleware');
const tokenUtils = require('../utils/tokenutils');

tokensRouter.post('/', middleware.filterLoggedIn, async (req, res) => {
    if (!req.body.signature) return res.status(400).send({ error: 'missing signature.' });
    const learnChainTokens = await tokenUtils.getUserLearnChainTokens(req.body.signature, req.user.walletAddress);
    res.status(200).json(learnChainTokens);
});

module.exports = tokensRouter;
