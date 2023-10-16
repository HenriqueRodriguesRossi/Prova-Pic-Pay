const jwt = require("jsonwebtoken");

function checkToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ 
            mensagem: "Primeiro faça o login!" 
        });
    }

    try {
        const secret = process.env.SECRET;

        // Verifique e decodifique o token
        const decoded = jwt.verify(token, secret);

        // Adicione as informações do usuário decodificadas ao objeto de solicitação
        req.user = decoded;

        // Continue para a próxima middleware
        next();
    } catch (err) {
        return res.status(401).json({ msg: "Token inválido ou expirado!" });
    }
}

module.exports = checkToken;