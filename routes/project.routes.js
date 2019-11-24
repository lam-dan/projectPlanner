module.exports = app => {
	const projects = require('../controller/project.controller')

	//Create a new Project
	app.post('/projects', projects.create)

	// Retrieve all Projects
	app.get('/projects', projects.getAllProjects)

	// Retrieve a single Project with a projectId
	// Project object includes lowest currentBid and currentBidder
	app.get('/projects/:projectId', projects.getProject)

	// Places the lowest minumum bid on a Project that a contractor is willing to
	// work to complete a project.
	app.put('/projects/bid/:projectId', projects.addBid)

	//Update a Project details
	app.put('/projects/:projectId', projects.updateProject)

	// Delete a Project with a projectId
	app.delete('/projects/:projectId', projects.deleteProject)
}
