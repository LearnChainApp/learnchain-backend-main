const axios = require('axios');

const getUserLearnChainTokens = async (signature, userWalletAddress) => {
    const allTokenIDsResponse = await axios.get(`${process.env.ABAKHUS_URL}/getTokensByOwner`, {
        params: { owner: userWalletAddress, signature },
        headers: { 'x-api-key': process.env.ABAKHUS_KEY },
    });
    const allTokenIDs = allTokenIDsResponse.data.ret;
    const tokenMetadataPromiseArray = allTokenIDs.map((tokenId) =>
        axios.get(`${process.env.ABAKHUS_URL}/getMetadataByTokenId`, {
            params: { owner: userWalletAddress, tokenId },
            headers: { 'x-api-key': process.env.ABAKHUS_KEY },
        }),
    );
    const allTokenMetadataResponse = await Promise.all(tokenMetadataPromiseArray);
    const learnChainTokensMetadata = allTokenMetadataResponse
        .map((response, index) => ({ ...response.data.metadata, tokenId: allTokenIDs[index] }))
        .filter((metadata) => metadata.platform === 'LearnChain');
    return learnChainTokensMetadata;
};

module.exports = { getUserLearnChainTokens };
