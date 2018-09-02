const Sequelize = require('sequelize')

const sequelize = new Sequelize('mainDB', null, null, {
    dialect: 'sqlite',
    storage: './db.sqlite'
})

const Photo = sequelize.define('photo', {
    src: Sequelize.STRING,
    title: Sequelize.STRING,
    location: Sequelize.STRING,
    width: Sequelize.INTEGER,
    height: Sequelize.INTEGER,
    meta: Sequelize.STRING,
    date: Sequelize.DATEONLY
})

const Project = sequelize.define('project', {
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
    startDate: Sequelize.DATEONLY,
    endDate: Sequelize.DATEONLY
})

const Category = sequelize.define('category', {
    title: Sequelize.STRING
})

sequelize.sync()
