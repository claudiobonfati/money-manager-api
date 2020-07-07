const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: [ 
            'expense', 
            'income' 
        ],
        required: true,
        trim: true,
    },
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
            'paypal' 
        ],
        required: true,
    }
})

categorySchema.virtual('contracts', {
    ref: 'Contract',
    localField: '_id',
    foreignField: 'category'
})

const ContractCat = mongoose.model('TransactionCat', categorySchema)

module.exports = ContractCat