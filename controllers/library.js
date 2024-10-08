const libraryRouter = require('express').Router();
const tokenUtils = require('../utils/tokenutils');
const Course = require('../models/Course');
const axios = require('axios');
const { PinataSDK } = require('pinata-web3');

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY_URL,
});

libraryRouter.post('/my-courses/', async (req, res) => {
    if (!req.body.signature) return res.status(400).send({ error: 'missing signature.' });
    const learnChainTokens = await tokenUtils.getUserLearnChainTokens(req.body.signature, req.user.walletAddress);
    const availableCoursesPromiseArray = learnChainTokens.map((token) => Course.findOne({ uuid: token.courseUUID }));
    const availableCoursesBrute = await Promise.all(availableCoursesPromiseArray);
    const availableCoursesBruteWithIds = availableCoursesBrute.map((course, index) => ({
        ...course.toJSON(),
        tokenId: learnChainTokens[index].tokenId,
    }));
    const availableCourses = availableCoursesBruteWithIds.filter((course) => course !== null && course !== undefined);
    res.status(200).json(availableCourses);
});

libraryRouter.get('/my-courses/:tokenId', async (req, res) => {
    const tokenMetadataResponse = await axios.get(`${process.env.ABAKHUS_URL}/getMetadataByTokenId`, {
        params: { owner: req.user.walletAddress, tokenId: req.params.tokenId },
        headers: { 'x-api-key': process.env.ABAKHUS_KEY },
    });
    const course = await Course.findOne({ uuid: tokenMetadataResponse.data.metadata.courseUUID });
    if (course === null || course === undefined) return res.status(400).send({ error: 'course not found' });
    const cids = course.cids;
    if (!cids?.length) return res.status(400).send({ error: 'course has no material' });
    const urlsPromiseArray = cids.map((cid) => pinata.gateways.convert(cid));
    const urls = await Promise.all(urlsPromiseArray);
    res.status(200).json(urls);
});

module.exports = libraryRouter;
