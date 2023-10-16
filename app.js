const express = require("express")
const app = express()
const cors = require("cors")
require("dotenv").config()
require("./database/connect")

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

const CommonUserRouter = require("./controllers/CommonUserController")
app.use(CommonUserRouter)

const LojistUserSchema = require("./controllers/LojistUserController")
app.use(LojistUserSchema)

app.listen(8080, ()=>{
    console.log("Servidor rodando na porta 8080!")
})