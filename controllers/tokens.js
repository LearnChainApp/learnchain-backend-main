const tokensRouter = require('express').Router();
const axios = require('axios');
const middleware = require('../utils/middleware');

tokensRouter.post('/', middleware.filterLoggedIn, async (req, res) => {
    if (!req.body.signature) return res.status(400).send({ error: 'missing signature.' });
    const allTokensRequest = await axios.get(`${process.env.ABAKHUS_URL}/getTokensByOwner`, {
        params: { owner: req.user.walletAddress, signature: req.body.signature },
        headers: { 'x-api-key': process.env.ABAKHUS_KEY },
    });
    const tokenIDPromiseArray = allTokensRequest.data.ret.map((token) =>
        axios.get(`${process.env.ABAKHUS_URL}/getMetadataByTokenId`, {
            params: { owner: req.user.walletAddress, tokenId: token },
            headers: { 'x-api-key': process.env.ABAKHUS_KEY },
        }),
    );
    const allTokensMetadataRequest = await Promise.all(tokenIDPromiseArray);
    const allTokensMetadata = allTokensMetadataRequest.map((response) => response.data.metadata);
    res.status(200).json(allTokensMetadata.filter((md) => md.platform === 'LearnChain'));
});

module.exports = tokensRouter;
