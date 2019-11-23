const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
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
