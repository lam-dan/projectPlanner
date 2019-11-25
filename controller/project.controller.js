const Project = require('../model/project.model')
const mongoose = require('mongoose')
const Bid = mongoose.model('Bid')

module.exports = {
	//Create a Project
	create: (req, res) => {
		// Fast exit to check if request body exists
		if (!req.body) {
			return res.status(400).send({
				message: 'Project content cannot be empty.'
			})
		}
		// Prevent contractors from creating projects
		if (req.body.type === 1) {
			return res.status(403).send({
				message: `Permission denied with id ${req.params.projectId}.`
			})
		}
		// Create new Project from request body
		const project = new Project({
			name: req.body.name || 'No Project Name.',
			createdBy: req.body.createdBy,
			description: req.body.description,
			budget: req.body.budget,
			date: req.body.date
		})

		// Asychronously save project in database
		project
			.save()
			.then(project => {
				res.send({
					status: 'Success',
					message: 'Project created.',
					data: { project: project }
				})
			})
			.catch(err => {
				res.status(500).send({
					message:
						err.message ||
						'Something went wrong while creating the project.'
				})
			})
	},

	// Get all projects
	getAllProjects: (req, res) => {
		Project.find()
			.then(projects => {
				res.send({
					status: 'Success',
					message: 'Projects found.',
					data: { projects: projects }
				})
			})
			.catch(err => {
				res.status(500).send({
					message:
						err.message ||
						'Something went wrong while retrieving projects.'
				})
			})
	},

	// Get a project which includes the lowest bid amount in currentBid if one exists
	// and the person who placed that bid in currentBidder
	getProject: (req, res) => {
		Project.findById(req.params.projectId)
			.then(project => {
				if (!project) {
					return res.status(400).send({
						message: `Project not found with id ${req.params.projectId}.`
					})
				}
				res.send({
					status: 'Success',
					message: 'Project found.',
					data: { project: project }
				})
			})
			.catch(err => {
				if (err.kind === 'ObjectId') {
					return res.status(400).send({
						message: `Project not found with id ${req.params.projectId}.`
					})
				}
				return res.status(500).send({
					message: `Something wrong retrieving project with id ${req.params.projectId}`
				})
			})
	},

	// Add a new bid.
	addBid: (req, res) => {
		// Fast exit to check if request body exists
		if (!req.body) {
			return res.status(400).send({
				message: 'Bid cannot be empty.'
			})
		}
		// Prevent clients from bidding on projects.
		if (req.body.type === 2) {
			return res.status(403).send({
				message: `Permission denied with id ${req.params.projectId}.`
			})
		}
		// Create a new bid
		let newBid = new Bid({
			minBid: req.body.minBid,
			userId: req.body.userId
		})

		Project.findById(req.params.projectId)
			.then(project => {
				if (!project) {
					return res.status(400).send({
						message: `Project not found with id ${req.params.projectId}.`
					})
				}
				// Check if the user's bid lower is than the budget OR
				// if the user's bid is past the due deadline
				if (
					newBid.minBid > project.budget ||
					newBid.createdAt > project.date
				) {
					return res.status(400).send({
						message:
							'Bid cannot be placed because it exceeds project budget or due date.'
					})
				}

				// Set the first bid on the project to be the budget amount
				if (!project.currentBid) {
					project.currentBid = project.budget
					project.currentBidder = newBid
				}
				// Check if the subsequent bids are lower than the current bid on the project.
				else if (newBid.minBid < project.currentBid) {
					// Check if user's lowest bid is lower than the lowest minimum bid of the current bidder
					if (newBid.minBid < project.currentBidder.minBid) {
						project.currentBid = newBid.minBid
						project.currentBidder = newBid
					} else {
						// If a bid placed is not lower, than set their min bid as the new current bid,
						// while keeping the current bidder
						project.currentBid = newBid.minBid
					}
				}

				// Add bid to project bid history Array
				project.bidHistory.push(newBid)

				// Save the project after updates
				project
					.save()
					.then(project => {
						res.send({
							status: 'Success',
							message: 'Project updated with new bid.',
							data: { project: project }
						})
					})
					.catch(err => {
						res.status(500).send({
							message:
								err.message ||
								'Something went wrong while updating the project.'
						})
					})
			})
			.catch(err => {
				if (err.kind === 'ObjectId') {
					return res.status(400).send({
						message: `Project not found with id ${req.params.projectId}`
					})
				}
				return res.status(500).send({
					message: `Something wrong retrieving project with id ${req.params.projectId}`
				})
			})
	},

	// Delete a project with the specified projectId in the request.
	deleteProject: (req, res) => {
		// Prevents contractors from deleting projects
		if (req.body.type === 1) {
			return res.status(403).send({
				message: `Permission denied with id ${req.params.projectId}.`
			})
		}
		Project.findById(req.params.projectId)
			.then(project => {
				if (!project) {
					return res.status(400).send({
						message: `Project not found with id ${req.params.projectId}.`
					})
				}
				// Validation to only allow the user who created the project to delete the project
				if (project.createdBy !== req.body.userId) {
					return res.status(403).send({
						message: `Permission denied with id ${req.params.projectId}.`
					})
				}
				project
					.remove()
					.then(project => {
						res.send({
							status: 'Success',
							message: 'Project was successfully deleted.'
						})
					})
					.catch(err => {
						res.status(500).send({
							message:
								err.message ||
								'Something went wrong while deleting the project.'
						})
					})
			})
			.catch(err => {
				if (err.kind === 'ObjectId') {
					return res.status(400).send({
						message: `Project not found with id ${req.params.projectId}.`
					})
				}
				return res.status(500).send({
					message: `Could not delete project with id ${req.params.projectId}`
				})
			})
	},

	// Updates a project with the request body for a client.
	updateProject: (req, res) => {
		// Fast exit to check if request body exists.
		if (!req.body) {
			return res.status(400).send({
				message: 'Project content cannot be empty.'
			})
		}
		// Prevents contrators from updating projects
		if (req.body.type === 1) {
			return res.status(403).send({
				message: `Permission denied with id ${req.params.projectId}.`
			})
		}

		Project.findById(req.params.projectId)
			.then(project => {
				if (!project) {
					return res.status(400).send({
						message: `Project not found with id ${req.params.projectId}.`
					})
				}
				// Validation to only allow the user who created the project to update the project
				if (project.createdBy !== req.body.userId) {
					return res.status(403).send({
						message: `Permission denied with id ${req.params.projectId}.`
					})
				}
				project.name = req.body.name
				project.description = req.body.description
				project.budget = req.body.budget
				project.date = req.body.date
				project
					.save()
					.then(project => {
						res.send({
							status: 'Success',
							message: 'Project was successfully updated.',
							data: { project: project }
						})
					})
					.catch(err => {
						res.status(500).send({
							message:
								err.message ||
								'Something went wrong while deleting the project.'
						})
					})
			})
			.catch(err => {
				if (err.kind === 'ObjectId') {
					return res.status(400).send({
						message: `Project not found with id ${req.params.projectId}.`
					})
				}
				return res.status(500).send({
					message: `Could not delete project with id ${req.params.projectId}`
				})
			})
	}
}
