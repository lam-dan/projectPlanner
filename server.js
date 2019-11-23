// Server Dependencies
const express = require('express')
const bodyParser = require('body-parser')
const config = require('./config')
const mongoose = require('mongoose')

// Using promises in mongoose
mongoose.Promise = global.Promise

// Connecting to the database
mongoose
	.connect(config.url, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => {
		console.log('Successfully connected to the database.')
	})
	.catch(err => {
		console.log('Could not connect to the database. Exiting now...', err)
		process.exit()
	})

const app = express()

// Parse Requests
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Default route
app.get('/', (req, res) => {
	res.json({ message: 'Welcome to the project marketplace.' })
})

// Listen to port 3000
app.listen(config.serverPort, () => {
	console.log('Server is listening to port 3000.')
})
