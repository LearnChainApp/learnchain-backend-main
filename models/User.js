const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    uName: { type: String, required: true, unique: true, minLength: 3 },
    name: { type: String, required: true },
    passHash: { type: String, required: true },
    walletAddress: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.passHash;
    },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
