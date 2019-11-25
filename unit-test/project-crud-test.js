// const projectService = require('../controller/project.controller')

// describe('Test Project Crud', () => {
// 	//Using the super user api's create method to create super user
// 	it('Successfully create a project', async () => {
// 		// precursor to create super user before we can test
// 		var body = {
// 			name: req.body.name,
// 			createdBy: req.body.createdBy,
// 			description: req.body.description,
// 			budget: req.body.budget,
// 			date: req.body.date,
// 			type: 2
// 		}

// 		var project = await projectService.create(body)
// 		expect(project.status).toEqual('Success.')
// 		expect(project.message).toEqual('Project created.')
// 		expect(project.message).toEqual('Project created.')
// 	})

// 	it('Create a project with no request body', async () => {
// 		// precursor to create super user before we can test
// 		var project = await projectService.create()
// 		expect(project.status).toEqual(403)
// 		expect(project.message).toEqual(
// 			`Permission denied with id ${req.params.projectId}`
// 		)
// 	})

// 	it('Create a project with user type equal to 1', async () => {
// 		// precursor to create super user before we can test
// 		var body = {
// 			name: req.body.name,
// 			createdBy: req.body.createdBy,
// 			description: req.body.description,
// 			budget: req.body.budget,
// 			date: req.body.date,
// 			type: 1
// 		}

// 		var project = await projectService.create(body)
// 		expect(project.status).toEqual(403)
// 		expect(project.message).toEqual(
// 			`Permission denied with id ${req.params.projectId}`
// 		)
// 	})
// })
