import express from 'express'

const app = express()

app.get(`/ok`, (request, response) => {
    response.send({ message: 'ok' })
})

export default app
