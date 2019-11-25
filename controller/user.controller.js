const User = require('../model/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const saltRounds = 10

module.exports = {
	create: (req, res, next) => {
		console.log('Create controller here')
		// Fast exit to check if request body exists
		if (!req.body) {
			return res.status(400).send({
				message: 'Project content cannot be empty.'
			})
		}
		// Create new User from request body and hash & salt their password
		const user = new User({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			type: req.body.type,
			password: bcrypt.hashSync(req.body.password, saltRounds)
		})

		// Asychronously save user in database
		user.save()
			.then(user => {
				res.send({ message: 'User created successfully.' })
			})
			.catch(err => {
				res.status(500).send({
					message:
						err.message ||
						'Something went wrong while creating the user.'
				})
			})
	},
	// Authenticate users upon when they log by checking their password and
	// generating a one hour expiring token for them
	authenticate: (req, res) => {
		User.findOne({ email: req.body.email })
			.then(user => {
				if (bcrypt.compareSync(req.body.password, user.password)) {
					const token = jwt.sign(
						{ id: user._id },
						req.app.get('secretKey'),
						{ expiresIn: '1h' }
					)
					res.send({
						status: 'Success',
						message: 'User authenticated.',
						data: { user: user, token: token }
					})
				}
			})
			.catch(err => {
				res.send({
					status: 'Error',
					message: err.message || 'Invalid email or password.',
					data: null
				})
			})
	}
}
