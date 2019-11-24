const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema(
	{
		firstName: {
			type: String,
			required: true
		},
		lastName: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
			match: /\S+@\S+\.\S+/
		},
		// Account role: type 1 = contractor, type 2 = client
		// Determines what operations are allowed in the database
		type: { type: Number, required: true, default: 1 },

		// updated to an array of objects to allow multiple phone numbers
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
