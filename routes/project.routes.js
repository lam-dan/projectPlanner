var jwt = require('jsonwebtoken')

// Method ran on all private api endpoints.
const validateUser = (req, res, next) => {
	// Verifies token from headers against server secrey key token and if successfully decoded
	// passes the user id to the request.
	try {
		let decoded = jwt.verify(
			req.headers['x-access-token'],
			req.app.get('secretKey')
		)
		req.body.userId = decoded.id
		req.body.type = decoded.type
		next()
	} catch (err) {
		res.send({
			status: 'Error',
			message: err.message,
			data: null
		})
	}
}

module.exports = app => {
	const projects = require('../controller/project.controller')
	const users = require('../controller/user.controller')

	/** @PrivateRoutes require token auth */
	//Create a new Project
	app.post('/projects', validateUser, projects.create)

	// Retrieve all Projects
	app.get('/projects', validateUser, projects.getAllProjects)

	// Retrieve a single Project with a projectId
	// Project object includes lowest currentBid and currentBidder
	app.get('/projects/:projectId', validateUser, projects.getProject)

	// Places the lowest minumum bid on a Project that a contractor is willing to
	// work.
	app.put('/projects/bid/:projectId', validateUser, projects.addBid)

	//Update a Project details
	app.put('/projects/:projectId', validateUser, projects.updateProject)

	// Delete a Project with a projectId
	app.delete('/projects/:projectId', validateUser, projects.deleteProject)

	/** @PublicRoutes do not require token auth */
	// Registers a user
	app.post('/users/create', users.create)

	// Authenticates a user
	app.post('/users/authenticate', users.authenticate)
}
