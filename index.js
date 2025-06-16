const express=require('express')
const morgan=require('morgan')
const cors=require('cors')
const app=express()
app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
// app.use(express.static('dist'));
let persons=[
    { id: "1", name: "Arto Hellas", number: "040-123456" },
  { id: "2", name: "Ada Lovelace", number: "39-44-5323523" },
  { id: "3", name: "Dan Abramov", number: "12-43-234345" },
  { id: "4", name: "Mary Poppendieck", number: "39-23-6423122" }
]
app.get('/api/persons',(request,response)=>
{
    response.json(persons)
})
app.get('/info',(request,response)=>
{
    const count=persons.length;
    const time=new Date()
    response.send(`
        <div>
            <h4>Phone book has info for ${count}</h4>
            <p>${time}
            </p>
        </div>
    `)
})

app.get('/api/persons/:id',(request,response)=>
{
    const id=request.params.id
    const person=persons.find(n=>n.id==id)
    if(person)
    {
        response.json(person)
    }
    else
    response.status(404).end()
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(note => note.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' })
  }

  const newPerson = {
    id: `${Math.floor(Math.random() * 10000)}`,
    name: body.name,
    number: body.number
  }

  persons.push(newPerson)
  response.status(201).json(newPerson)
})
const port=3002
app.listen(port,()=>
{
    console.log(`server is running on port ${port}`)
})