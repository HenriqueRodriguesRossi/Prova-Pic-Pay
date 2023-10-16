const LojistUser = require("../models/LogistUser")
const router = require("express").Router()
const yup = require("yup")
const captureErrorYup = require("../utils/captureErrorYup")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

function cnpjValidator(value) {
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

    if (!cnpjRegex.test(value)) {
        return false;
    }

    const cnpj = value.replace(/[^\d]+/g, '');

    // Verifica se todos os dígitos são iguais, o que invalida o CNPJ
    if (/^(\d)\1+$/.test(cnpj)) {
        return false;
    }

    // Calcula os dois dígitos verificadores
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i), 10) * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }

    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;

    if (result !== parseInt(digits.charAt(0), 10)) {
        return false;
    }

    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i), 10) * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }

    result = sum % 11 < 2 ? 0 : 11 - sum % 11;

    if (result !== parseInt(digits.charAt(1), 10)) {
        return false;
    }

    return true;
}

router.post("/new-lojist-user", async (req, res) => {
    try{
        const { full_name, cnpj, email, password } = req.body

        const LojistUserSchema = yup.object().shape({
            full_name: yup.string().required("O nome completo é obrigatório!").min(3, "O nome completo deve ter no mínimo 3 caracteres!"),
            cnpj: yup.string().test('cnpj', 'CNPJ inválido', cnpjValidator).required('CNPJ é obrigatório'),
            email: yup.string().email("Digite um email válido!").required("O email é obrigatório!"),
            password: yup.string().required("A senha é obrigatória!").min(8, "A senha deve ter no mínimo 8 caracteres!").max(20, "A senha deve ter no máximo 20 caracteres!")
        })
    
        await LojistUserSchema.validate(req.body, { abortEarly: false })

        const emailValidate = await LojistUser.findOne({email})
        const cnpjValidate = await LojistUser.findOne({cnpj})

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
        const passwordHash = await bcrypt(password, 20)

        const newLojistUser = new LojistUser({
            full_name,
            cnpj: cnpjHash,
            email,
            password: passwordHash
        })

        await newLojistUser.save()

        return res.status(201).send({
            mensagem: "Lojista cadastrado com sucesso!"
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
                mensagem: "Erro ao cadastrar o logista!"
            })
        } 
    }
})

router.post("/lojist-login", async (req, res)=>{
    try{
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).send({
                mensagem: "Todos os campos são os obrigatórios!"
            })
        }

        const checkEmail = await LojistUser.findOne({email})
        const checkPassword = await bcrypt.compare(password, checkEmail.password)

        if(!checkEmail || !checkPassword){
            return res.status(422).send({
                mensagem: "Email ou senha incorretos!"
            })
        }

        const secret = process.env.SECRET

        const token = jwt.sign({
            id: checkEmail._id
        }, secret)

        return res.status(200).send({
            mensagem: "Login efetuado com sucesso!",
            token: token,
            lojist_id: checkEmail._id
        })
    }catch(error){
        console.log(error)
        return res.status(500).send({
            mensagem: "Erro ao efetuar o login!"
        })
    }
})

module.exports = router