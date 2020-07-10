const mongoose = require('mongoose')
const ContractCat = require('./contract-cat')
const ContractCatTerm = require('./contract-cat-term')
const Transaction = require('./transaction')
const getNextWeekDayDate = require('../helpers/date')

const contractSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: [ 
            'expense', 
            'income' 
        ],
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Contract value cannot be negative!')
            }
        }
    },
    recurrence: {
        type: String,
        enum: [ 
            'once', 
            'weekly', 
            'every_two_weeks', 
            'monthly' 
        ],
        required: false,
        default: false,
    },
    installments: {
        type: Number, // 0 = lifetime 
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('"Installments" cannot be a negative number!')
            }
        }
    },
    dayDue: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 1) {
                throw new Error('"Date Due" cannot be a negative number!')
            }
        }
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract-Cat'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

contractSchema.virtual('transactions', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'contract'
})

contractSchema.pre('save', async function (next) {
    const contract = this
    const titleWords = contract.title.toLowerCase().split(' ')
    
    let term = null 
    let category = null 

    term = await ContractCatTerm.findOne({
        term: { $in: titleWords }
    })

    if (term) {
        category = await ContractCat.findById(term.category)

        if (category) contract.category = category._id
    }

    next()
})

contractSchema.post('save', async function (doc) {
    const contract = doc
    const limit = 24
    const today = new Date()
    const loop = (contract.installments === 0 ? limit : contract.installments)
    let transactions = []

    if (contract.recurrence === 'once') {
        const transactionObj = {
            date: contract.date,
            price: contract.price,
            contract: contract._id
        }

        transactions.push(transactionObj)

        await transaction.save()
    } else if (contract.recurrence === 'monthly') {
        let date = new Date()
        const startMonth = (today.getDate() <= contract.dayDue ? 0 : 1)

        for (i = 0; i < loop; i++) {
            date.setMonth(today.getMonth() + startMonth + i)
            date.setDate(contract.dayDue - 1)
            
            const transactionObj = {
                date: date,
                price: contract.price,
                contract: contract._id
            }

            transactions.push(transactionObj)

            date = new Date()
        }
    } else {
        let frequencyDay = 0

        if (contract.recurrence === 'weekly'){
            frequencyDay = 7
        } else if (contract.recurrence === 'every_two_weeks'){
            frequencyDay = 14
        }

        for (i = 0; i < loop; i++) {
            const date = getNextWeekDayDate(today, contract.dayDue, (i * frequencyDay))
            
            const transactionObj = {
                date: date,
                price: contract.price,
                contract: contract._id
            }

            transactions.push(transactionObj)
        }
    }

    const transactionSaved = await Transaction.insertMany(transactions)

    if (!transactionSaved)
        throw new Error('Error while saving transactions!')
})

const Contract = mongoose.model('Contract', contractSchema)

module.exports = Contract