const mongoose = require('mongoose');

const storeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    icon: {
        type: String
    },
    color: {
        type: String
    }
});

storeSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

storeSchema.set('toJSON', {
    virtuals: true
});

exports.Store = mongoose.model('Store', storeSchema);
exports.storeSchema = storeSchema;
