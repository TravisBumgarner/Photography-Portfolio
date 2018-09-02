import app from './app'

const port = process.env.PORT || 8000

app.listen(port, () => {
    console.log(`Running on port ${port}`) // eslint-disable-line no-console
})
