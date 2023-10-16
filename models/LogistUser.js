const mongoose = require("mongoose")

const LogistUserSchema = new mongoose.Schema({
    full_name:{
        type: String,
        required: true
    },
    cnpj:{
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }, 
    password:{
        type: String,
        required: true
    },
    type_of_accont:{
        type: String,
        default: "LOJIST"
    },
    created_at:{
        type: Date,
        default: Date().now
    }
})

module.exports = mongoose.model("LojistUser", LogistUserSchema)