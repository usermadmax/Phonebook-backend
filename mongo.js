const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = encodeURIComponent(process.argv[2]);
const dbName = 'Persons'; // Specify database name
const url = `mongodb+srv://GaneshGannu:${password}@cluster0.vesholq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: Number,
})

const Person = mongoose.model('Persons', personSchema)

const person= new Person({
  name : 'Anu',
  number: 76574515856,
})

person.save().then(result => {
  console.log('person saved!')
  mongoose.connection.close()
})
