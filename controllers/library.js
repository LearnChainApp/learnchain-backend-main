const libraryRouter = require('express').Router();
const tokenUtils = require('../utils/tokenutils');
const Course = require('../models/Course');

libraryRouter.post('/my-courses/', async (req, res) => {
    if (!req.body.signature) return res.status(400).send({ error: 'missing signature.' });
    const learnChainTokens = await tokenUtils.getUserLearnChainTokens(req.body.signature, req.user.walletAddress);
    const availableCoursesPromiseArray = learnChainTokens.map((token) => Course.findOne({ uuid: token.courseUUID }));
    const availableCoursesBrute = await Promise.all(availableCoursesPromiseArray);
    const availableCoursesBruteWithIds = availableCoursesBrute.map((course, index) => 
        ({ ...(course.toJSON()), tokenId: learnChainTokens[index].tokenId}));
    const availableCourses = availableCoursesBruteWithIds.filter((course) => course !== null && course !== undefined);
    res.status(200).json(availableCourses);
});

module.exports = libraryRouter;
