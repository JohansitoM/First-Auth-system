const jwt = require('jsonwebtoken')

const authenticate = (req, res, next) => { 
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado'})
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        res.status(403).json({ error: 'Token inválido o expirado' })
    }
}

module.exports = authenticate