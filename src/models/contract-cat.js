const mongoose = require('mongoose')

const contractCatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    icon: {
        type: String,
        enum: [ 
            'pizza', 
            'medic', 
            'apple', 
            'paypal',
            'money',
        ],
        required: true,
    }
}, {
    timestamps: true
})

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