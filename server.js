// Server Dependencies
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

// Parse Requests
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Enable CORS for all HTTP methods
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*')
	res.header(
		'Access-Control-Allow-Methods',
		'GET, PUT, POST, DELETE, OPTIONS'
	)
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	)
	next()
})

// Configuring the database
const config = require('./config')
const mongoose = require('mongoose')
require('./routes/project.routes')(app)

// Using promises in mongoose
mongoose.Promise = global.Promise

// Connecting to the database
mongoose
	.connect(config.url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true
	})
	.then(() => {
		console.log('Successfully connected to the database.')
	})
	.catch(err => {
		console.log('Could not connect to the database. Exiting now...', err)
		process.exit()
	})

// Default route
app.get('/', (req, res) => {
	res.json({ message: 'Welcome to the project marketplace.' })
})

// Listen to port 3000
app.listen(config.serverPort, () => {
	console.log('Server is listening to port 3000.')
})
