const express = require("express")
const morgan = require("morgan")
const cors = require("cors")

const app = express()
app.use(morgan(function (tokens, req, res) {
    let str = ''
    if (tokens.method(req, res) == 'POST'){
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
app.use(express.static('build'))
app.use(express.json());
app.use(cors())


let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const generateId = () => {
    let result = Math.floor(Math.random() * 5000)
    if(persons.find(person => person.id == result)){
        return generateId()
    }else{
        return result
    }
}

app.get('/api', (request, response) => {
    response.send("go /persons for persons list")
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if(person){
        response.json(person)
    }else{
        response.status(404).end()
    }
    
})

app.get('/info', (request, response) => {
    let date = new Date(Date.now()).toUTCString()
    response.send(`<p>Phonebook has info about ${persons.length} people</p><p>${date}</p>`)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id != id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(request.body)

    if(!body.name || !body.number){
        response.status(400).json({ 
            error: 'content missing' 
        })
    }

    if(persons.find(person => person.name == body.name)){
        response.status(400).json({
            error: 'name is already in use'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)
    response.json(person)

})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`app on port ${PORT}`)
})