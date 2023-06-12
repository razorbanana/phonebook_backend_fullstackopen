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
    console.error(`errorHandler is called with ${error.message}`)

    if (error.name === 'CastError') {
        console.log(`error.name = CastError`)
        return response.status(400).send({ error: 'malformatted id' })
    }else if(error.name === 'ValidationError'){
        console.log(`error.name = ValidationError`)
        return response.status(400).json({ error: error.message })
    }else{
        console.log(`error.name = else`)
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

const Person = require('./models/person')


app.get('/api', (request, response) => {
    console.log(`get /api`)
    response.send("go /persons for persons list")
})

app.get('/api/persons', (request, response) => {
    console.log(`get /api/persons`)
    Person.find({}).then(persons => {
        response.json(persons)
    })
    .catch(error => next(error))

})

app.get('/api/persons/:id', (request, response, next) => {
    console.log(`get /api/persons/:id`)
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
    console.log(`put /api/persons/:id`)
    const { name, number } = request.body
  
    Person.findByIdAndUpdate(request.params.id, { name, number } , { new: true, runValidators: true, context: 'query' })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

app.get('/info', (request, response) => {  
    console.log(`get /info`)
    Person.find({}).then(persons => {
        let date = new Date(Date.now()).toUTCString()
        response.send(`<p>Phonebook has info about ${persons.length} people</p><p>${date}</p>`)
    })
    .catch(error => next(error)) 
})

app.delete('/api/persons/:id', (request, response) => {
    console.log(`delete /api/persons/:id`)
    const id = Number(request.params.id)
    Person.findByIdAndDelete(request.params.id).then(res=>{
        response.status(204).end()
    }).catch(error=>next(error))
})

app.post('/api/persons', (request, response, next) => {
    console.log(`post /api/persons`)
    const body = request.body
    console.log(request.body)

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