const Transaction = require("../models/Transaction")
const User = require("../models/User")
const router = require("express").Router()
const checkToken = require("../utils/checkToken")

router.post("/new-transaction/:id", checkToken, async (req, res) => {
    try {
        const { id_sender, id_reciever, ammount } = req.body

        if (!id_sender || !id_reciever || !ammount) {
            return res.status(400).send({
                mensagem: "A transação não pode ser concluída, preencha todos os campos!"
            })
        }else if(id_sender == id_reciever){
            return res.status(422).send({
                mensagem: "Erro ao realizar a transação!"
            })
        }

        const senderValidate = await User.findById({ id: id_sender })
        const recieverValidate = await User.findById({ id: id_reciever })

        if (!senderValidate || !recieverValidate) {
            return res.status(404).send({
                mensagem: "Não foi possível concluir a transação, existem informações incorretas!"
            })
        } else if (senderValidate.type_of_account == "LOGIST") {
            return res.status(422).send({
                mensagem: "Logistas não estão autorizados a fazer transações!"
            })
        } else if (senderValidate.ammount < ammount) {
            return res.status(422).send({
                mensagem: "Saldo insuficiente!"
            })
        }
        
        axios.get("https://run.mocky.io/v3/8fafdd68-a090-496f-8c9a-3442cf30dae6")
        .then((response) => {
            const responseMessage = response.message

            if (responseMessage == "Aprovado") {
                console.log("Transação aprovada!")
            } else {
                console.log("Transação reprovada!")
                
                return res.status(500).send({
                    mensagem: "Transação recusada!"
                })
            }
        }).catch(error => {
            console.log("Transação reprovada: " + error)

            return res.status(500).send({
                mensagem: "Transação recusada!"
            })
        })

        const newTransaction = new Transaction({
            id_sender,
            id_reciever,
            ammount
        })

        await newTransaction.save()

        return res.status(201).send({
            mensagem: "Transação efetuada!",
            infos: newTransaction
        })
    } catch (error) {
        console.log(error)

        return res.status(500).send({
            mensagem: "Erro ao efetuar a transação!"
        })
    }
})

module.exports = router