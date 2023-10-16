const User = require("../models/User")
const yup = require("yup")
const bcrypt = require("bcryptjs")
const captureErrorYup = require("../utils/captureErrorYup")
const router = require("express").Router()
const jwt = require("jsonwebtoken")

router.post("/new-common-user", async (req, res)=>{
    debugger
    try{
        const {full_name, cpf, email, password} = req.body

        const UserSchema = yup.object().shape({
            full_name: yup.string().required("O nome completo é obrigatório!").min(3, "O nome completo deve ter no mínimo 3 caracteres!"),
            cpf: yup.string().required("O cpf é obrigatório!").min(11, "O cpf deve ter 11 caracteres!").max(11, "O cpf deve ter 11 caracteres!"),
            email: yup.string().email("Digite um email válido!").required("O email é obrigatório!"),
            password: yup.string().required("A senha é obrigatória!").min(8, "A senha deve ter no mínimo 8 caracteres!").max(20, "A senha deve ter no máximo 20 caracteres!")
        })

        await UserSchema.validate(req.body, {abortEarly: false})

        const emailValidate = await User.findOne({email})
        const cpfValidate = await User.findOne({cpf})

        if(emailValidate){
            return res.status(422).send({
                mensagem: "Este email já foi cadastrado!"
            })
        }else if(cpfValidate){
            return res.status(422).send({
                mensagem: "Este cpf já foi cadastrado!"
            })
        }

        const cpfHash = await bcrypt.hash(cpf, 20)
        const passwordHash = await bcrypt.hash(password, 20)

        const newCommonUser = new User({
            full_name,
            cpf: cpfHash,
            email,
            password: passwordHash
        })

        await newCommonUser.save()

        return res.status(201).send({
            mensagem: "Usuário cadastrado com sucesso!"
        })
    }catch(error){
        console.log(error)
        if(error instanceof yup.ValidationError){
            const errors = [captureErrorYup(error)]

            return res.status(500).send({
                errors
            })
        }else{
            return res.status(500).send({
                mensagem: "Erro ao cadastrar o usuário!"
            })
        }
       
    }
})

router.post("/new-logist-user", async (req, res)=>{
    try{
        const { full_name, cnpj, email, password } = req.body

        const LogistUserSchema = yup.object().shape({
            full_name: yup.string().required("O nome completo é obrigatório!").min(3, "O nome completo deve ter no mínimo 3 caracteres!"),
            cnpj: yup.string().min(14, "O cnpj deve ter 14 dígitos!").max(14, "O cnpj deve ter 14 dígitos!").required('CNPJ é obrigatório'),
            email: yup.string().email("Digite um email válido!").required("O email é obrigatório!"),
            password: yup.string().required("A senha é obrigatória!").min(8, "A senha deve ter no mínimo 8 caracteres!").max(20, "A senha deve ter no máximo 20 caracteres!")
        })
    
        await LogistUserSchema.validate(req.body, { abortEarly: false })

        const emailValidate = await User.findOne({
            email
        })

        const cnpjValidate = await User.findOne({
            cnpj
        })

        if(emailValidate){
            return res.status(422).send({
                mensagem: "Este email já foi cadastrado!"
            })
        }else if(cnpjValidate){
            return res.status(422).send({
                mensagem: "Este cnpj já foi cadastrado!"
            })
        }

        const cnpjHash = await bcrypt.hash(cnpj, 20)
        const passwordHash = await bcrypt.hash(password, 20)

        const account_type = "LOGIST"
        const newLogistUser = new User({
            full_name,
            cnpj: cnpjHash,
            email,
            password: passwordHash,
            type_of_account: account_type
        })

        newLogistUser.save()

        return res.status(201).send({
            mensagem: "Logista cadastrado com sucesso!"
        })
    }catch(error){
        if(error instanceof yup.ValidationError){
            const errors = [captureErrorYup(error)]

            return res.status(500).send({
                errors
            })
        }else{
            console.log(error)
            return res.status(500).send({
                mensagem: "Erro ao cadastrar o logista!"
            })
        } 
    }
})

router.post("/user-login", async (req, res)=>{
    try{
        const {email, password} = req.body

        const checkEmail = await User.findOne({email})
        const checkPassword = await bcrypt.compare(password, checkEmail.password)
    
        if(!email || !password){
            return res.status(400).send({
                mensagem: "Todos os campos são obrigatórios!"
            })
        }else if(!checkEmail || !checkPassword){
            return res.status(404).send({
                mensagem: "Email ou senha estão incorretos!"
            })
        }

        const secret = process.env.SECRET

        const token = await jwt.sign({
            id: checkEmail._id
        }, secret)

        return res.status(200).send({
            mensagem: "Login efetuado com sucesso!",
            token: token,
            user_id:  checkEmail._id
        })
    }catch(error){
        console.log(error)
        return res.status(500).send({
            mensagem: "Erro ao efetuar o login!"
        })
    }
})

module.exports = router