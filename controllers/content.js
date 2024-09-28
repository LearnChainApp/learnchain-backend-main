const contentRouter = require('express').Router();
const multer = require('multer');
const middleware = require('../utils/middleware');
const Course = require('../models/Course');

const storage = multer.diskStorage({
    destination: function(req, res, cb) {
        cb(null, 'content/');
    },
    filename: function(req, file, cb) {
        const fileExtension = file.originalname.split('.')[1];
        const newFileName = `${req.user.uName}-${req.body.title}-${file.originalname.split('.')[0]}`;

        cb(null, `${newFileName}.${fileExtension}`);
    }
});

const content = multer({ storage });

contentRouter.post('/', [middleware.filterLoggedIn, content.array('material', 12)], async (req, res) => {
    if (!req.files?.length) {
        res.status(400).send({ error: 'nenhum arquivo anexado' });
        return
    }
    const { title, price, description } = req.body;
    const author = req.user.name;
    const authoruName = req.user.uName;
    const fileNames = req.files.map(file => `${authoruName}-${title}-${file.originalname.split('.')[0]}.${file.originalname.split('.')[1]}`);
    const newCourse = new Course({
        title,
        author,
        authoruName,
        description,
        price,
        fileNames,
        uuid: crypto.randomUUID()
    })

    const savedCourse = await newCourse.save();
    console.log(savedCourse);
    res.status(201).json(savedCourse);
})

module.exports = contentRouter;