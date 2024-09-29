const contentRouter = require('express').Router();
const multer = require('multer');
const middleware = require('../utils/middleware');
const Course = require('../models/Course');

//---------------------[SETUP DO MULTER]------------------------------------------------------//
const getFileName = (uName, courseTitle, fileOriginalName) => `${uName}-${courseTitle}-${fileOriginalName}`;

//Verificação tem que ser feita aqui para evitar baixar arquivos provenientes de forms inválidos.
const fileFilter = (req, file, cb) => {
    const passes = (req.body.title && req.body.description && req.body.price && !isNaN(req.body.price));
    cb(null, passes);
}

const storage = multer.diskStorage({
    destination: function(req, res, cb) {
        cb(null, 'content/');
    },
    filename: function(req, file, cb) {
        cb(null, getFileName(req.user.uName, req.body.title, file.originalname));
    }
});

const content = multer({ storage, fileFilter });

//----------------[ROTAS]--------------------------------------------------------------------//
contentRouter.post('/', [middleware.filterLoggedIn, content.array('material', 12)], async (req, res) => {
    if (!req.files?.length) { //Testa se a array files está vazia ou não existe
        res.status(400).send({ error: 'no files attached or invalid parameters' });
        return
    }
    console.log(req.files.map(file => file.originalname))
    const { title, price, description } = req.body;
    const author = req.user.name;
    const authoruName = req.user.uName;
    const fileNames = req.files.map(file => getFileName(authoruName, title, file.originalname));
    const newCourse = new Course({
        title,
        author,
        authoruName,
        description,
        price,
        fileNames,
        uuid: crypto.randomUUID()
    });

    const savedCourse = await newCourse.save();
    console.log(savedCourse);
    res.status(201).json(savedCourse);
})

contentRouter.get('/', async (req, res) => {
    const courses = Course.find({});
    res.status(200).json(courses);
})

module.exports = contentRouter;