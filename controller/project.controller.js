const Project = require('../model/project.model')
const mongoose = require('mongoose')
const Bid = mongoose.model('Bid')

// Function to get the current date for a new bid.
const __getDate = () => {
	let today = new Date()
	let dd = String(today.getDate()).padStart(2, '0')
	let mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
	let yyyy = today.getFullYear()
	today = mm + '/' + dd + '/' + yyyy
	return today
}

module.exports = {
	//Create a Project.
	create: (req, res) => {
		// Fast exit to check if request body exists.
		if (!req.body) {
			return res.status(400).send({
				message: 'Project content cannot be empty.'
			})
		}
		// Destructuring for readability
		const { name, userId, description, budget, date, type } = req.body

		// Prevent contractors from creating projects
		if (type === 1) {
			return res.status(403).send({
				message: `Permission denied on project creation.`
			})
		}
		// Create new Project from request body
		const project = new Project({
			name: name || 'No Project Name.',
			createdBy: userId,
			description: description,
			budget: budget,
			date: date
		})

		// Asychronously save project in database
		project
			.save()
			.then(project => {
				res.send({
					status: 'Success.',
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
		// Prevent contractors from creating see all projects
		if (type === 1) {
			return res.status(403).send({
				message: `Permission denied on projects list.`
			})
		}
		Project.find()
			.then(projects => {
				res.send({
					status: 'Success.',
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

				// Prevent contractors from seeing another contractor's lowest bid
				// They are only allowed to see the current winning bid.
				if (type === 1) {
					const filtered = Object.keys(project)
						.filter(key => key !== 'currentBidder')
						.reduce((obj, key) => {
							obj[key] = project[key]
							return obj
						}, {})
				}

				res.send({
					status: 'Success.',
					message: 'Project found.',
					data: { project: filtered ? filtered : project }
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

	// Method only for contractors to add a new bid.  We won't return
	addBid: (req, res) => {
		// Fast exit to check if request body exists
		if (!req.body || req.body.minBid < 0) {
			return res.status(400).send({
				message: 'Bid cannot be empty or negative.'
			})
		}

		// Destructuring for readability
		const { minBid, type, userId } = req.body

		// Prevent clients from bidding on projects.
		if (type === 2) {
			return res.status(403).send({
				message: `Permission denied with id ${req.params.projectId}.`
			})
		}

		// Create a new bid
		let newBid = new Bid({
			minBid: minBid,
			userId: userId,
			bidDate: __getDate()
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
					newBid.bidDate > project.date
				) {
					res.send({
						status: 'Fail.',
						message: `Bid cannot be placed because it exceeds the project budget of ${project.budget} or date of ${project.date}.`,
						data: {
							newBid: newBid
						}
					})
					return
				}
				// Set the first bid on the project to be the budget amount
				if (!project.currentBid) {
					project.currentBid = project.budget
					project.currentBidder = newBid
				}
				// Check if the subsequent bids are lower than the current bid on the project.
				else if (newBid.minBid < project.currentBid) {
					// Check if the user's lowest bid is lower than the lowest minimum bid of the current bidder
					if (newBid.minBid < project.currentBidder.minBid) {
						project.currentBid = newBid.minBid
						project.currentBidder = newBid
						message = `Congratulations. You are now the lowest bidder at ${newBid.minBid}`
					} else {
						// If a bid placed is not the current bidder's lowest bid, than set the new min bid as the new current bid,
						// while keeping the current bidder
						project.currentBid = newBid.minBid
						message = `Unfortunately, your new bid of ${newBid.minBid} is not lower than the current bidder's lowest bid`
					}
				} else {
					// If the bid placed isn't lower than the current bid.
					res.send({
						status: 'Fail.',
						message: `New bid ${newBid.minBid} is not lower than the current bid of ${project.currentBid}.`,
						data: {
							newBid: newBid
						}
					})
					return
				}

				// Only add successful bids to the project bid history Array
				project.bidHistory.push(newBid)

				// Return saved project after updates
				return project.save().then(project => {
					res.send({
						status: 'Success.',
						message: message,
						data: {
							newBid: newBid
						}
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
					message: `Something went wrong updating the project with id ${req.params.projectId}`
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
				return project.remove()
			})
			.then(project => {
				res.send({
					status: 'Success.',
					message: 'Project was successfully deleted.'
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

		// Desctructuring for readability
		const { type, userId, name, description, budget, date } = req.body

		// Prevents contrators from updating projects
		if (type === 1) {
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
				if (project.createdBy !== userId) {
					return res.status(403).send({
						message: `Permission denied with id ${req.params.projectId}.`
					})
				}
				// Update found project with req body properties.
				project.name = name
				project.description = description
				project.budget = budget
				project.date = date
				return project.save()
			})
			.then(project => {
				res.send({
					status: 'Success.',
					message: 'Project was successfully updated.',
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
					message: `Could not delete project with id ${req.params.projectId}`
				})
			})
	}
}
