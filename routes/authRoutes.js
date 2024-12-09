const express = require('express')
const { register, login, verifyEmail, forgotPassword, resetPassword, passport } = require('../controllers/authController')
const authenticate = require('../middleware/authMiddleware')
const User = require('../models/User')
const router = express.Router()

// Iniciar autenticación con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// Callback de Google
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        // Redirigir al frontend con el token jwt
        res.redirect('http://localhost:5000/users?token=${req.user.token}')
    }
)

// Ruta protegida para obtener usuarios registrados
router.get('/users', authenticate, async (req, res) => {
    try {
        const users = await User.findAll( { attributes: ['id', 'name', 'email'] })
        console.log(users)
        res.status(200).json(users)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error al obtener usuarios' })
    }
})

router.post('/register', register)
router.post('/login', login)
router.get('/verify-email/:token', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

router.put('/users/:id', authenticate, async (req, res) => {
    const { id } = req.params; // ID del usuario que se va a editar
    const { email, name } = req.body;

    try {
        const user = await User.findByPk(id); // Buscar usuario por ID

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Actualizar datos del usuario
        user.email = email || user.email;
        user.name = name || user.name;
        await user.save();

        res.status(200).json({ message: 'Usuario actualizado correctamente', user });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

router.delete('/users/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id); // Buscar usuario por ID

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await user.destroy(); // Eliminar el usuario
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});


module.exports = router