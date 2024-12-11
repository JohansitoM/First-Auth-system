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
app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`)
})
