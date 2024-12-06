const dotenv = require('dotenv')
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes')

dotenv.config()
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json())
app.use('/api/auth', authRoutes)


// Inicia el server
const PORT = process.env.PORT || 5000;
// const SECRET_KEY = process.env.SECRET_KEY;
app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`)
})

// const users = [{name: "a", email: "a@gmail.com", password:"1234"}];

// // Funcion para generar un token JWT
// function generateToken(user) {
//     return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' })
// }

// app.post('/api/signup', async(req,res) => {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//         return res.status(400).json({ message: 'Todos los campos son obligatorios' });
//     }

//     // Verificar si el usuario ya existe
//     const userExists = users.find(user => user.email === email);
//     if(userExists) {
//         console.log('Usuarios actuales ', users)
//         res.status(400).json({ message: 'El usuario ya existe' });
//     }

//     // Encriptar la contraseña
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = {name, email, password: hashedPassword};
//     users.push(newUser);

//     res.status(201).json({message: 'Usuario registrado exitosamente.'})
// })

// // Ruta del login
// app.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     // Verificar si el usuario existe
//     const user = users.find(user => user.email === email);
//     if(!user) {
//         return res.status(400).json({ message: 'El usuario no está registrado' });
//     }

//     // Verificar la contraseña
//     const isPasswordValid = await bcrypt.compare(password, user.password)
//     if(!isPasswordValid) {
//         return res.status(400).json({ message: 'Usuario o contraseña incorrectos'});
//     }

//     // Generar un token si la autenticación es correcta
//     const token = generateToken(user);
//     res.json({ token });
// })

// // Middleware para proteger rutas, verificando el token
// function authenticateToken(req, res, next) {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if(!token) return res.sendStatus(401); // No se proporcionó un token

//     jwt.verify(token, SECRET_KEY, (err, user) => {
//         if (err) return res.sendStatus(403); // Token inválido o expirado
//         req.user = user;
//         next();
//     });
// }

// // Ruta protegida que solo se puede acceder con un token válido
// app.get('/protected', authenticateToken, (req, res) => {
//     res.json({ message: 'Accediste a una ruta protegida'});
// })