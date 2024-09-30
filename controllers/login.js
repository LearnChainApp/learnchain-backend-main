const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const loginRouter = require('express').Router();

loginRouter.post('/', async (req, res) => {
    const { uName, pass } = req.body;
    const user = await User.findOne({ uName });
    const passCorrect = user == null ? false : await bcrypt.compare(pass, user.passHash);

    if (user === null || !passCorrect) {
        return res.status(401).json({ error: 'invalid username or password' });
    }

    const userForToken = {
        uName: user.uName,
        id: user.id,
        walletAddress: user.walletAddress,
        uuid: user.uuid,
    };
    const token = jwt.sign(userForToken, process.env.SECRET);

    res.status(200).send({
        token,
        uName: user.uName,
        name: user.name,
        walletAddress: user.walletAddress,
        uuid: user.uuid,
    });
});

module.exports = loginRouter;
