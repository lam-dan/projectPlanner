module.exports = app => {
	const projects = require('../controller/project.controller')

	//Create a new Project
	app.post('/projects', projects.create)

	// Retrieve all Projects
	app.get('/projects', projects.getAllProjects)

	// Retrieve a single Project with a projectId
	// Project object includes lowest currentBid and currentBidder
	app.get('/projects/:projectId', projects.getProject)

	//Update a Project
	app.put('/projects/:projectId', projects.updateProject)

	// Delete a Prjoejct with a projectId
	app.delete('/projects/:projectId', projects.deleteProject)
}
