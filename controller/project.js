const Project = require('../model/project')
const User = require('../model/user')

//Create a Project
exports.create = (req, res) => {
	if (!req.body) {
		return res.status(400).send({
			message: 'Project content cannot be empty.'
		})
	}

	const project = new Project({
		name: req.body.name || 'No Project Name.',
		createdBy: req.body.userId,
		description: req.body.description,
		budget: req.body.budget,
		date: req.body.date
	})

	project
		.save()
		.then(data => {
			res.send(data)
		})
		.catch(err => {
			res.status(500).send({
				message:
					err.message ||
					'Something went wrong while creating the product.'
			})
		})
}

// Get a project
// Project object will also include the lowest bid amount for a project if one exists.
// It will be stored in 
exports.getProject = (req, res) => {
	Project.findOne(req.params.projectId)
		.then(project => {
			if (!project) {
				return res.status(400).send({
					message: 'Product not found with id ' + req.params.projectId
				})
			}
			res.send(project)
		})
		.catch(err => {
			if (err.kind === 'ObjectId') {
				return res.status(400).send({
					message: 'Product not found with id ' + req.params.projectId
				})
			}
			return res.status(500).send({
				message:
					'Something wrong retrieving product with id ' +
					req.params.productId
			})
		})
}


// Add a new bid.
