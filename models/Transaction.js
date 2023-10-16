const mongoose = require("mongoose")

const TransactionSchema = new mongoose.Schema({
    id_sender:{
        type: String,
        required: true
    },
    id_reciever:{
        type: String,
        required: true
    },
    ammount:{
        type: Number,
        required: true
    },
    created_at:{
        type: Date,
        default: Date().now
    }
})

module.exports = mongoose.model("Transaction", TransactionSchema)