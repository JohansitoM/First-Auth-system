const { authenticateToken } = require('../controllers/authController')
const { showUsers } = require('../controllers/userController')
const express = require('express')
const router = express.Router()

// Ruta protegida que solo se puede acceder con un token válido
router.get('/protected', authenticateToken, async (req, res) => {
    res.json({ message: 'Accediste a una ruta protegida'});

    try {
        const users = await User.findAll()

        if(users.length == 0) {
            return res.status(404).json({ error: 'No se encontraron usuarios' })
        }
        res.json(users)
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios', details})
    }
})

module.exports = router