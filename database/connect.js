const mongoose = require("mongoose")
const user = process.env.USER
const pass = process.env.PASS

const conn = ()=>{
    mongoose.connect(`mongodb+srv://${user}:${pass}@cluster0.tar553x.mongodb.net/?retryWrites=true&w=majority`)

    const connection = mongoose.connection

    connection.on("open", ()=>{
        console.log("Conectado com sucesso!")
    })

    connection.on("error", (error)=>{
        console.log("Erro ao conectar: " + error)
    })
}

conn()
module.exports = mongoose