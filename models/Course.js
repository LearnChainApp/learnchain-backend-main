const mongoose = require("mongoose");

const courseSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  authoruName: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  fileNames: [{ type: String }],
  uuid: { type: String, required: true },
});

courseSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.fileNames;
  },
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
