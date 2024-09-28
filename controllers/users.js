const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/User');

usersRouter.post('/', async (req, res) => {
    const { uName, name, pass, walletAddress } = req.body;
    const passHash = await bcrypt.hash(pass, 10);
    const user = new User({
        uName,
        name,
        passHash,
        walletAddress
    });

    const savedUser = await user.save();
    console.log(savedUser);
    res.status(201).json(savedUser);
});

usersRouter.get('/', async (req, res) => {
    const users = await User.find({});
    res.json(users);
})

module.exports = usersRouter;