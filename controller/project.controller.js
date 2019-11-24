const Project = require('../model/project.model')
const User = require('../model/user.model')
const mongoose = require('mongoose')
const Bid = mongoose.model('Bid')

//Create a Project
exports.create = (req, res) => {
	// Fast exit to check if request body exists
	if (!req.body) {
		return res.status(400).send({
			message: 'Project content cannot be empty.'
		})
	}

	const project = new Project({
		name: req.body.name || 'No Project Name.',
		createdBy: req.body.createdBy,
		description: req.body.description,
		budget: req.body.budget,
		date: req.body.date
	})

	project
		.save()
		.then(project => {
			res.send(project)
		})
		.catch(err => {
			res.status(500).send({
				message:
					err.message ||
					'Something went wrong while creating the project.'
			})
		})
}

// Get all projects
exports.getAllProjects = (req, res) => {
	Project.find()
		.then(projects => {
			res.send(projects)
		})
		.catch(err => {
			res.status(500).send({
				message:
					err.message ||
					'Something went wrong while retrieving projects.'
			})
		})
}

// Get a project which includes the lowest bid amount in currentBid if one exists
// and the person who placed that bid in currentBidder
exports.getProject = (req, res) => {
	Project.findOne(req.params.projectId)
		.then(project => {
			if (!project) {
				return res.status(400).send({
					message: 'Project not found with id ' + req.params.projectId
				})
			}
			res.send(project)
		})
		.catch(err => {
			if (err.kind === 'ObjectId') {
				return res.status(400).send({
					message: 'Project not found with id ' + req.params.projectId
				})
			}
			return res.status(500).send({
				message:
					'Something wrong retrieving project with id ' +
					req.params.projectId
			})
		})
}

// Add a new bid.
exports.addBid = (req, res) => {
	// Fast exit to check if request body exists
	if (!req.body) {
		return res.status(400).send({
			message: 'Bid cannot be empty.'
		})
	}

	let newBid = new Bid({
		minBid: req.body.minBid,
		userId: req.body.userId
	})

	Project.findOne(req.params.projectId)
		.then(project => {
			if (!project) {
				return res.status(400).send({
					message: 'Project not found with id ' + req.params.projectId
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
						'Bid cannot be placed because it is too high or past the due date'
				})
			}

			// Check current bid to see it does not exist
			if (!project.currentBid) {
				project.currentBid.set(newBid.minBid)
				project.currentBidder.set(newBid)
			}

			// Check if the user's bid is lower than the current bid.
			else if (newBid.minBid < project.currentBid) {
				// Check if user's bid is lower than the lowest minimum bid of the current bidder
				if (newBid.minBid < project.currentBidder.minBid) {
					project.currentBid.set(newBid.minBid)
					project.currentBidder.set(newBid)
				} else {
					// If a bid placed is not lower, than set their min bid as the new current bid,
					// while keeping the current bidder
					project.currentBid.set(newBid.minBid)
				}
			}

			// Added bid to bid history Array
			project.bidHistory.push(newBid)

			// Save the project after updates
			project
				.save()
				.then(project => {
					res.send(project)
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
					message: 'Project not found with id ' + req.params.projectId
				})
			}
			return res.status(500).send({
				message:
					'Something wrong retrieving project with id ' +
					req.params.projectId
			})
		})
}

// Delete a project with the specified projectId in the request.
exports.deleteProject = (req, res) => {
	Project.findByIdAndRemove(req.params.projectId)
		.then(project => {
			if (!project) {
				return res.status(404).send({
					message: 'Project not found with id ' + req.params.projectId
				})
			}
			res.send({
				message: 'Project deleted successfully.'
			})
		})
		.catch(err => {
			if (err.kind === 'ObjetId' || err.name === 'NotFound') {
				return res.status(404).send({
					message: 'Project not found with id ' + req.params.projectId
				})
			}
			return res.status(500).send({
				message:
					'Could not delete project with id ' + req.params.projectId
			})
		})
}

// Updates a project with the request body for a client.
exports.updateProject = (req, res) => {
	// Fast exit to check if request body exists.
	if (!req.body) {
		return res.status(400).send({
			message: 'Project content cannot be empty.'
		})
	}
	//Find and update project with the request body.
	Project.findByIdAndUpdate(
		req.params.projectId,
		{
			name: req.body.name,
			createdBy: req.body.createdBy,
			description: req.body.description,
			budget: req.body.budget,
			date: req.body.date
		},
		{ new: true }
	)
		.then(project => {
			if (!project) {
				return res.status(404).send({
					message: 'Project not found with id ' + req.params.projectId
				})
			}
			res.send(project)
		})
		.catch(err => {
			if (err.kind === 'ObjectId') {
				return res.status(404).send({
					message: 'Project not found with id ' + req.params.projectId
				})
			}
			return res.status(500).send({
				message:
					'Something wrong updating note with id ' +
					req.params.projectId
			})
		})
}
