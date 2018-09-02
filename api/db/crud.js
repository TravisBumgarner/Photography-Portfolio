const models = require('./models')

const createPhoto = () => {
    models.Photo.create({
        src: 'https://foo.com/bar.jpg',
        title: 'Foo',
        location: 'Boston, MA',
        width: 500,
        height: 500,
        meta: 'f/1.8 20" 200ISO',
        date: new Date()
    }).then(task => {
        console.log(task)
    })
}

createPhoto()
