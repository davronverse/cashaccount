const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AliasSchema = new Schema({
    alias: {
        type: String,
        required: true
    },
    txid: {
        type: String,
        required: false
    },
    block: {
        type: Number
    },
    payment_data: {
        type: Map,
        of: String,
        required: true
    },
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('Alias', AliasSchema);