
const mongoose = require('mongoose')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

// updated

// MongoDB setup
const password = encodeURIComponent( process.argv[2])
const dbName = 'Persons' // Database name
const url = `mongodb+srv://GaneshGannu:${password}@cluster0.vesholq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Set Mongoose options
mongoose.set('strictQuery', false)

// Connect to MongoDB
mongoose.connect(url)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas')
    // List all collections in the database
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('❌ Error listing collections:', err.message)
        return
      }
      console.log('📋 Collections in database:', collections.map(c => c.name))
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    console.error('Full error:', err)
    process.exit(1) // Exit if connection fails
  })

// Define schema
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, 'Name must be at least 3 characters long'],
    required: [true, 'Name is required']
  },
  number: {
    type: String,
    required: [true, 'Number is required']
  }
})
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});
// Map to the 'persons' collection
const Person = mongoose.model('Persons', personSchema)

// Express setup
const app = express()
app.use(cors())
app.use(express.json())
app.use((error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
})
app.use(morgan('tiny'))

// Route to fetch all persons
app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(persons => {
      console.log('📋 Fetched persons:', persons) // Log fetched data
      response.json(persons)
    })
    .catch(err => {
      console.error('❌ Error fetching persons:', err.message)
      response.status(500).json({ error: 'Server error' })
    })
})

// Route to show info
app.get('/api/info', (request, response) => {
  Person.countDocuments({})
    .then(count => {
      const time = new Date()
      response.send(`
        <div>
          <h4>Phone book has info for ${count} people</h4>
          <p>${time}</p>
        </div>
      `)
    })
    .catch(err => {
      console.error('❌ Error counting documents:', err.message)
      response.status(500).send('Server error')
    })
})

// Add a person
app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'Name or number missing' })
  }

  const newPerson = new Person({
    name: body.name,
    number: Number(body.number) // Ensure number is a Number
  })

  newPerson.save()
    .then(savedPerson => {
      console.log('📋 Saved person:', savedPerson)
      response.status(201).json(savedPerson)
    })
    .catch(err => {
      console.error('❌ Error saving person:', err.message)
      response.status(400).json({ error: err.message })
    })
})

// Delete a person
app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then(deletedPerson => {
      if (deletedPerson) {
        console.log(`📋 Deleted person with ID ${id}`)
        response.status(204).end()
      } else {
        console.log(`📋 Person with ID ${id} not found`)
        response.status(404).json({ error: 'Person not found' })
      }
    })
    .catch(err => {
      console.error(`❌ Error deleting person with ID ${id}:`, err.message)
      response.status(500).json({ error: 'Server error' })
    })
})
app.put('/api/persons/:id', (request, response) => {
  const { name, number } = request.body;

  const updatedPerson = {
    name,
    number
  };

  Person.findByIdAndUpdate(request.params.id, updatedPerson, {
    new: true,
    runValidators: true,
    context: 'query'
  })
    .then((updated) => {
      if (updated) {
        console.log(`✅ Updated person ${updated.name} with new number ${updated.number}`);
        response.json(updated);
      } else {
        response.status(404).json({ error: 'Person not found' });
      }
    })
    .catch((err) => {
      console.error(`❌ Error updating person with ID ${request.params.id}:`, err.message);
      response.status(400).json({ error: 'Update failed' });
    });
});

// Route to seed data (optional, for inserting your provided data)
// app.get('/api/seed', (request, response) => {
//   const persons = [
//     { name: 'Anki', number: 765951519 },
//     { name: 'gannu', number: 765951519 }
//   ]
//   Person.deleteMany({}) // Clear existing data (optional, remove if you don't want to clear)
//     .then(() => Person.insertMany(persons))
//     .then(result => {
//       console.log('📋 Inserted persons:', result)
//       response.json({ message: 'Data seeded', data: result })
//     })
//     .catch(err => {
//       console.error('❌ Error seeding data:', err.message)
//       response.status(500).json({ error: 'Server error' })
//     })
// })

const port = 3002
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})