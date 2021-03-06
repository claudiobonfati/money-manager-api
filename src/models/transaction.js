const mongoose = require('mongoose')

// Transaction collection schema
const transactionSchema = new mongoose.Schema({
    price: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Transaction\'s value cannot be negative!')
            }
        }
    },
    date: {
        type: Date,
        required: true,
    },
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Contract'
    }
}, {
    timestamps: true
})

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction