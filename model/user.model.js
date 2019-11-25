const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10
const Schema = mongoose.Schema

const UserSchema = new Schema(
	{
		firstName: {
			type: String,
			trim: true,
			required: true
		},
		lastName: {
			type: String,
			trim: true,
			required: true
		},
		email: {
			type: String,
			trim: true,
			required: true,
			unique: true,
			match: /\S+@\S+\.\S+/
		},
		// Account role: type 1 = contractor, type 2 = client, type 9 = admin
		// TBD: Used for front end functionality and back-end permissions
		type: { type: Number, required: true },
		password: {
			type: String,
			trim: true,
			required: true
		},

		// An array of objects to allow multiple phone numbers
		phone: {
			type: [
				{
					phoneType: { type: String, required: true },
					number: { type: Number, required: true }
				}
			],
			required: false
		}
	},
	{ timestamps: true }
)

module.exports = mongoose.model('User', UserSchema)
