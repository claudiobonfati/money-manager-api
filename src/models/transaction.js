const mongoose = require('mongoose')

const Transaction = mongoose.model('Transaction', {
    price: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Transaction value cannot be negative!')
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
})

module.exports = Transaction