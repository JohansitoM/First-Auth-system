const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const User = require('../models/User')
passport.initialize()

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:5000/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Buscar o crear usuario en la base de datos
                let user = await User.findOne({ where: { googleId: profile.id } })

                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        isVerified: true,
                    })
                }

                // Generar token JWT 
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' })

                done(null, { ...user, token }) // Pasr el usuario y el token al siguiente paso
            } catch (error) {
                done(error, null)
            }
        }
    )
)

// Registro de Usuario 
const register = async (req, res) => {
    const { name, email, password } = req.body

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword })

        // Generar token de verificacion
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })

        // Enviar correo de verificacion
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        })

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Confirma tu correo electrónico",
            html: `<a href="${process.env.FRONTEND_URL}/verify-email/${token}">Verifica tu cuenta</a>`,
        }

        await transporter.sendMail(mailOptions)

        res.status(201).json({ message: 'Usuario registrado. Verifica tu correo.'})
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el usuario', error})
    }
}

// Login de Usuario
const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ where: { email } })
        if(!user) return res.status(404).json({ error: 'Usuario no encontrado' })

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) return res.status(400).json({ error: 'Contraseña incorrecta x_X'})
        
        if(!user.isVerified) return res.status(401).json({ error: 'Verifica tu correo antes de iniciar sesión'})

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn:'1d' })
        res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name } })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error al iniciar sesión' })
    }
}

// Verificar email 
const verifyEmail = async (req, res) => {
    const { token } = req.params
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        await User.update({ isVerified: true }, { where: { id: decode.id } })
        res.status(200).json({ message: 'Correo verificado exitosamente' })
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: 'Token inválido o expirado' })
    }
}

// Recuperar contraseña
const forgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ where: { email }})
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h'})

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        })

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Recuperar tu contraseña',
            html: `<a href="${process.env.FRONTEND_URL}/reset-password/${token}">Recuperar contraseña</a>`,
        }

        await transporter.sendMail(mailOptions)
        res.status(200).json({ message: 'Correo enviado para recuperarla contraseña' })
    } catch (error) {
        res.status(500).json({ error: 'Error al enviar el correo' })
    }
}

// Resetear Contraseña 
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await User.update({ password:hashedPassword }, { where: { id: decoded.id } })
        res.status(200).json({ message: 'Contraseña actualizada exitosamente' })
    } catch (error) {
        res.status(400).json({ error: 'Token inválido o expirado'})
    }
}

module.exports = {
    passport,
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword
}