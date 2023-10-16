const express = require("express");
const yup = require("yup");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const captureErrorYup = require("../utils/captureErrorYup");

const router = express.Router();

async function cadastrarUsuario(req, res, schema, type_of_account) {
    try {
        const { full_name, cpf, cnpj, email, password } = req.body;

        const userSchema = yup.object().shape(schema);

        await userSchema.validate(req.body, { abortEarly: false });

        const emailValidate = await User.findOne({ email });
        const documentValidate = type_of_account === "COMMON" ? await User.findOne({ cpf }) : await User.findOne({ cnpj });

        if (emailValidate) {
            return res.status(422).send({
                mensagem: "Este email já foi cadastrado!",
            });
        } else if (documentValidate) {
            const documentType = type_of_account === "COMMON" ? "CPF" : "CNPJ";
            return res.status(422).send({
                mensagem: `Este ${documentType} já foi cadastrado!`,
            });
        }

        const hashedDocument = type_of_account === "COMMON" ? await bcrypt.hash(cpf, 20) : await bcrypt.hash(cnpj, 20);
        const passwordHash = await bcrypt.hash(password, 20);

        const newUser = new User({
            full_name,
            [type_of_account === "COMMON" ? "cpf" : "cnpj"]: hashedDocument,
            email,
            password: passwordHash,
            type_of_account,
        });

        await newUser.save();

        const user_type = type_of_account === "COMMON" ? "usuário" : "logista";
        return res.status(201).send({
            mensagem: `${user_type} cadastrado com sucesso!`,
        });
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            const errors = [captureErrorYup(error)];

            return res.status(500).send({
                errors,
            });
        } else {
            console.log(error);
            return res.status(500).send({
                mensagem: `Erro ao cadastrar o ${type_of_account === "COMMON" ? "usuário" : "logista"}!`,
            });
        }
    }
}

router.post("/new-common-user", async (req, res) => {
    return cadastrarUsuario(req, res, {
        full_name: yup.string().required("O nome completo é obrigatório!").min(3, "O nome completo deve ter no mínimo 3 caracteres!"),
        cpf: yup.string().required("O CPF é obrigatório!").min(11, "O CPF deve ter 11 caracteres!").max(11, "O CPF deve ter 11 caracteres!"),
        email: yup.string().email("Digite um email válido!").required("O email é obrigatório!"),
        password: yup.string().required("A senha é obrigatória!").min(8, "A senha deve ter no mínimo 8 caracteres!").max(20, "A senha deve ter no máximo 20 caracteres!"),
    }, "COMMON");
});

router.post("/new-logist-user", async (req, res) => {
    return cadastrarUsuario(req, res, {
        full_name: yup.string().required("O nome completo é obrigatório!").min(3, "O nome completo deve ter no mínimo 3 caracteres!"),
        cnpj: yup.string().min(14, "O CNPJ deve ter 14 dígitos!").max(14, "O CNPJ deve ter 14 dígitos!").required("CNPJ é obrigatório"),
        email: yup.string().email("Digite um email válido!").required("O email é obrigatório!"),
        password: yup.string().required("A senha é obrigatória!").min(8, "A senha deve ter no mínimo 8 caracteres!").max(20, "A senha deve ter no máximo 20 caracteres!"),
    }, "LOGIST");
});

router.post("/user-login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const checkEmail = await User.findOne({ email });
        const checkPassword = await bcrypt.compare(password, checkEmail.password);

        if (!email || !password) {
            return res.status(400).send({
                mensagem: "Todos os campos são obrigatórios!",
            });
        } else if (!checkEmail || !checkPassword) {
            return res.status(404).send({
                mensagem: "Email ou senha estão incorretos!",
            });
        }

        const secret = process.env.SECRET;

        const token = await jwt.sign({
            id: checkEmail._id,
        }, secret);

        return res.status(200).send({
            mensagem: "Login efetuado com sucesso!",
            token: token,
            user_id: checkEmail._id,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            mensagem: "Erro ao efetuar o login!",
        });
    }
});

module.exports = router;
