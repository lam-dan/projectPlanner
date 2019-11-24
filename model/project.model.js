const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BidSchema = new Schema(
	{
		minBid: { type: Number, required: true },
		userId: { type: String, required: true }
	},
	{ timestamps: true }
)

mongoose.model('Bid', BidSchema)

const ProjectSchema = new Schema(
	{
		name: { type: String, required: true },
		createdBy: { type: String, required: true },
		description: { type: String, required: true },
		// Total budget for the project which current bid cannot exceed
		budget: { type: Number, required: true },
		date: { type: Date, required: true },
		// Current lowest bid for a project and cannot be smaller the minimum bid.
		currentBid: { type: Number, required: false },
		// Current lowest bidder which includes his maximum bid for the project.
		currentBidder: { type: BidSchema, required: false },
		// An array of Bid Schemas
		bidHistory: { type: [BidSchema], required: false }
	},
	{ timestamps: true }
)

module.exports = mongoose.model('Project', ProjectSchema)
