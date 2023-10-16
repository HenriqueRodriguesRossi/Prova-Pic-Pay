const express = require("express")
const app = express()
const cors = require("cors")
require("dotenv").config()
require("./database/connect")

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

const UserRouter = require("./controllers/UserController")
app.use(UserRouter)

const TransactionRouter = require("./controllers/Transaction")
app.use(TransactionRouter)

app.listen(8080, ()=>{
    console.log("Servidor rodando na porta 8080!")
})