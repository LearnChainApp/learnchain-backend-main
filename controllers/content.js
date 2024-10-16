const contentRouter = require('express').Router();
const multer = require('multer');
const middleware = require('../utils/middleware');
const Course = require('../models/Course');
const axios = require('axios');
const { PinataSDK } = require('pinata-web3');
const fs = require('node:fs');

//---------------------[SETUP DO MULTER]------------------------------------------------------//
/*
OBS: Arquivos são armazenados localmente com nomes únicos, a priori, 
para evitar sobreposições e race conditions
(apesar de serem posteriormente upados no IPFS)
*/
const getFileName = (uName, courseTitle, fileOriginalName) => `${uName}-${courseTitle}-${fileOriginalName}`;

const fileType = (fileOriginalName) => {
    //Essa função não *precisa* ser assim, mas estou mantendo por possível utilidade futura.
    const extension = fileOriginalName.split('.').at(-1);
    switch (extension) {
        case 'pdf':
            return 'application/pdf';
        case 'mp4':
            return 'application/mp4';
        default:
            return 'invalid';
    }
};

// Verificação tem que ser feita aqui para evitar baixar arquivos provenientes de forms inválidos.
const fileFilter = (req, file, cb) => {
    const passes =
        req.body.title &&
        req.body.description &&
        req.body.price &&
        !isNaN(req.body.price) &&
        fileType(file.originalname) !== 'invalid';
    req.allFilesPass = req.allFilesPass && passes;
    cb(null, passes);
};

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, `${process.env.FILE_DEST}`);
    },
    filename: function (req, file, cb) {
        cb(null, getFileName(req.user.uName, req.body.title, file.originalname));
    },
});

const content = multer({ storage, fileFilter });

//---------------------[SETUP DO PINATA]-------------------------------------------------------//

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY_URL,
});

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

contentRouter.post(
    '/',
    [middleware.filterLoggedIn, middleware.multerFileFilterSetup, content.array('material', 12)],
    async (req, res) => {
        //Testa se a array files está vazia, não existe, ou se nem todos os arquivos passaram pelo filtro
        if (!req.files?.length || !req.allFilesPass) {
            return res.status(400).send({
                error: 'no files attached, invalid files, or invalid parameters',
            });
        }

        const { title, price, description } = req.body;
        const author = req.user.name;
        const authoruName = req.user.uName;

        const fileNames = req.files.map((file) => getFileName(authoruName, title, file.originalname));
        const fileStreams = fileNames.map((fileName) => fs.createReadStream(`${process.env.FILE_DEST}${fileName}`));
        const uploadPromiseArray = fileStreams.map((stream) => pinata.upload.stream(stream));
        const fileUploadResults = await Promise.all(uploadPromiseArray);
        const cids = fileUploadResults.map((resultObject) => resultObject.IpfsHash);

        const newCourse = new Course({
            title,
            author,
            authoruName,
            description,
            price,
            cids,
            uuid: crypto.randomUUID(),
        });
        const savedCourse = await newCourse.save();
        console.log(savedCourse);
        res.status(201).json(savedCourse);
    },
);

contentRouter.post('/buy/:uuid', middleware.filterLoggedIn, async (req, res) => {
    const course = await Course.findOne({ uuid: req.params.uuid });
    if (course === null || course === undefined) return res.status(404).send({ error: 'course not found' });
    const tokendata = {
        platform: 'LearnChain',
        courseUUID: course.uuid,
        cids: course.cids,
    };
    const response = await axios.post(
        `${process.env.ABAKHUS_URL}/mint`,
        { owner: req.user.walletAddress, data: JSON.stringify(tokendata) },
        { headers: { 'x-api-key': process.env.ABAKHUS_KEY } },
    );
    console.log(response.body);
    res.status(200).send({ message: 'token minted' });
});

module.exports = contentRouter;
