const mongoose = require('mongoose');
//TODO: Adicionar verificação para impedir cursos repetidos
const courseSchema = mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    authoruName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    cids: [{ type: String }],
    uuid: { type: String, required: true },
});

courseSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
