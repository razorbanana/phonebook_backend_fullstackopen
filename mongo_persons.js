require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")

const app = express()
app.use(express.static('build'))
app.use(express.json());
app.use(morgan(function (tokens, req, res) {
    let str = ''
    if (tokens.method(req, res) == 'POST') {
        str = JSON.stringify(req.body)
    }
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        str
    ].join(' ')
}))
app.use(cors())

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

const Person = require('./models/person')


app.get('/api', (request, response) => {
    response.send("go /persons for persons list")
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
    .catch(error => next(error))

})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

app.get('/info', (request, response) => {  
    Person.find({}).then(persons => {
        let date = new Date(Date.now()).toUTCString()
        response.send(`<p>Phonebook has info about ${persons.length} people</p><p>${date}</p>`)
    })
    .catch(error => next(error)) 
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    Person.findByIdAndDelete(request.params.id).then(res=>{
        response.status(204).end()
    }).catch(error=>next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(request.body)

    if (!body.name || !body.number) {
        response.status(400).json({
            error: 'content missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(personSaved => {
        response.json(personSaved)
    }).catch(error => next(error))

})

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`app on port ${PORT}`)
})
