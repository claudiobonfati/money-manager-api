const mongoose = require('mongoose')

// Contract's Category collection schema
const contractCatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    icon: {
        type: String,
        enum: [ 
            'activity',
            'anchor',
            'coffee',
            'credit-card',
            'dollar-sign',
            'headphones',
            'map',
            'monitor',
            'shopping-cart',
            'smartphone',
            'tool',
            'bookmark',
            'star'
        ],
        required: true,
    }
}, {
    timestamps: true,
    toJSON: { 
        virtuals: true
    }
})

// Schema virtual fields
contractCatSchema.virtual('contracts', {
    ref: 'Contract',
    localField: '_id',
    foreignField: 'category'
})

contractCatSchema.virtual('terms', {
    ref: 'Contract-Cat-Term',
    localField: '_id',
    foreignField: 'category'
})

const ContractCat = mongoose.model('Contract-Cat', contractCatSchema)

module.exports = ContractCat