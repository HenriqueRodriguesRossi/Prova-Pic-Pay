const mongoose = require("mongoose")

const CommonUserSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    cpf:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    type_of_account:{
        type: String,
        required: false,
        default: "COMMON"
    },
    createdAt:{
        type: Date,
        default: Date().now
    }
})

module.exports = mongoose.model("CommonUser", CommonUserSchema)