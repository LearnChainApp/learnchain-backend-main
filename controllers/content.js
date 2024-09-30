const contentRouter = require('express').Router();
const multer = require('multer');
const middleware = require('../utils/middleware');
const Course = require('../models/Course');
const axios = require('axios');

//---------------------[SETUP DO MULTER]------------------------------------------------------//
const getFileName = (uName, courseTitle, fileOriginalName) => `${uName}-${courseTitle}-${fileOriginalName}`;

//Verificação tem que ser feita aqui para evitar baixar arquivos provenientes de forms inválidos.
const fileFilter = (req, file, cb) => {
    const passes = req.body.title && req.body.description && req.body.price && !isNaN(req.body.price);
    cb(null, passes);
};

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, 'content/');
    },
    filename: function (req, file, cb) {
        cb(null, getFileName(req.user.uName, req.body.title, file.originalname));
    },
});

const content = multer({ storage, fileFilter });

//----------------[ROTAS]--------------------------------------------------------------------//
contentRouter.get('/', async (req, res) => {
    const courses = await Course.find({});
    res.status(200).json(courses);
});

contentRouter.get('/:uuid', async (req, res) => {
    const desiredCourse = await Course.findOne({ uuid: req.params.uuid });
    if (desiredCourse === null || desiredCourse === undefined)
        return res.status(404).send({ error: 'course not found' });
    res.status(200).json(desiredCourse);
});

contentRouter.post('/', [middleware.filterLoggedIn, content.array('material', 12)], async (req, res) => {
    //Testa se a array files está vazia ou não existe
    if (!req.files?.length) {
        res.status(400).send({
            error: 'no files attached or invalid parameters',
        });
        return;
    }
    console.log(req.files.map((file) => file.originalname));
    const { title, price, description } = req.body;
    const author = req.user.name;
    const authoruName = req.user.uName;
    const fileNames = req.files.map((file) => getFileName(authoruName, title, file.originalname));
    const newCourse = new Course({
        title,
        author,
        authoruName,
        description,
        price,
        fileNames,
        uuid: crypto.randomUUID(),
    });

    const savedCourse = await newCourse.save();
    console.log(savedCourse);
    res.status(201).json(savedCourse);
});

contentRouter.post('/buy/:uuid', middleware.filterLoggedIn, async (req, res) => {
    const course = await Course.findOne({ uuid: req.params.uuid });
    if (course === null || course === undefined) {
        res.status(404).send({ error: 'course not found' });
        return;
    }
    const tokendata = {
        platform: 'LearnChain',
        owneruuid: req.user.uuid,
        courseTitle: course.title,
        courseUUID: course.uuid,
        fileNames: course.fileNames,
        cid: 'n/a',
    };
    try {
        const response = await axios.post(
            `${process.env.ABAKHUS_URL}/mint`,
            { owner: req.user.walletAddress, data: JSON.stringify(tokendata) },
            { headers: { 'x-api-key': process.env.ABAKHUS_KEY } },
        );
        console.log(response.body);
        res.status(200).send({ message: 'token minted' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'token mint error' });
    }
});

module.exports = contentRouter;
