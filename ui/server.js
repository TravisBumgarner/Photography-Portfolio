const path = require('path')
const express = require('express')

const app = express()

console.log(path.resolve(__dirname, './dist', 'index.html'))
app.use('/static', express.static(path.resolve(__dirname + '/dist')))
app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, './dist', 'index.html'))
})

const port = 25062
app.listen(port, () => {
    console.log(`Running on port ${port}`)
})

module.exports = app
