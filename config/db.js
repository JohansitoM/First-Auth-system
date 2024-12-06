const { Sequelize } = require('sequelize')
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
})

sequelize.authenticate()
    .then(() => console.log('Conexión a la base de datos exitosa ._.'))
    .catch(err => console.log('Error al conectar con la base de datos: :(', err))

module.exports = sequelize;