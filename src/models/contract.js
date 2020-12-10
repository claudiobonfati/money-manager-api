const mongoose = require('mongoose')
const ContractCat = require('./contract-cat')
const ContractCatTerm = require('./contract-cat-term')
const Transaction = require('./transaction')
const getNextWeekDayDate = require('../helpers/date')

// Contracts collection schema
const contractSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: {
            values: [ 
                'expense', 
                'income' 
            ],
            message: 'Invalid type'
        },
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Please, inform a price.'],
        validate(value) {
            if (value <= 0) {
                throw new Error('Contract price cannot be zero or negative!')
            }
        }
    },
    recurrence: {
        type: String,
        enum: {
            values: [ 
                'once', 
                'weekly', 
                'every_two_weeks', 
                'monthly' 
            ],
            message: 'Invalid recurrence'
        },
        required: false,
        default: false,
    },
    instalments: {
        type: Number,
        required: [true, 'Please, inform the instalments!'],
        validate(value) {
            if (value < 0) {
                throw new Error('Contract instalments cannot be a negative number!')
            }
        }
    },
    dayDue: {
        type: Number, // 0 = today
        required: [true, 'Please, inform the day due!'],
        validate(value) {
            if (value < 0) {
                throw new Error('Contract day due cannot be a negative number!')
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
}, {
    timestamps: true,
    toJSON: { 
        virtuals: true
    }
})

// Schema virtual fields
contractSchema.virtual('transactions', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'contract'
})

// Custom Schema functions
contractSchema.methods.findCategory = async function () {
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
}

// Create contract's transactions
contractSchema.methods.createTransactions = async function () {
    const contract = this
    const limit = 24 // Setting um contract's limit
    const today = new Date()
    const loop = (contract.instalments === 0 ? limit : contract.instalments)
    let transactions = []

    // For contracts with only one trasaction
    if (contract.recurrence === 'once') {
        const date = today.setDate(contract.dayDue)

        const transactionObj = {
            date,
            price: contract.price,
            contract: contract._id
        }

        transactions.push(transactionObj)
    } else if (contract.recurrence === 'monthly') {
        // For contracts with multiple monthly transactions
        let date = new Date()
        const startMonth = (today.getDate() <= contract.dayDue ? 0 : 1)

        // Create each transaction 
        for (i = 0; i < loop; i++) {
            date.setMonth(today.getMonth() + startMonth + i)
            date.setDate(contract.dayDue)
            
            const transactionObj = {
                date,
                price: contract.price,
                contract: contract._id
            }

            transactions.push(transactionObj)

            date = new Date()
        }
    } else {
        // For contracts with multiple transactions (weekly or every-two-weeks)
        let frequencyDay = 0

        if (contract.recurrence === 'weekly'){
            frequencyDay = 7
        } else if (contract.recurrence === 'every_two_weeks'){
            frequencyDay = 14
        }

        // Create each transaction 
        for (i = 0; i < loop; i++) {
            const date = getNextWeekDayDate(today, contract.dayDue, (i * frequencyDay))
            
            const transactionObj = {
                date,
                price: contract.price,
                contract: contract._id
            }

            transactions.push(transactionObj)
        }
    }

    // Insert transactions
    const transactionSaved = await Transaction.insertMany(transactions)

    if (!transactionSaved)
        throw new Error('Error while saving transactions!')
}

// Update transactions
contractSchema.methods.updateTransactions = async function () {
    let contract = this
    const today = new Date()
    today.setHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)

    const loop = (contract.instalments === 0 ? limit : contract.instalments)

    // Before creating new updated transactions, we must delete future transactions
    let allTransactions = await Transaction.countDocuments({ contract: contract._id })
    let futureTransactions = await Transaction.deleteMany({ contract: contract._id, date: { $gte: today } })

    // Update count of remaining transactions 
    contract.instalments = loop - (allTransactions - futureTransactions.deletedCount)

    if (contract.instalments > 0)
        await contract.createTransactions()
}

// Run before save any contract
contractSchema.pre('save', async function (next) {
    const contract = this

    // Validate recurrance
    if (contract.recurrence === 'once' &&
        contract.instalments !== 1)
        next(new Error('Recurrence and instalments not matching!'))

    if (contract.recurrence === 'weekly'            && contract.dayDue > 7 || 
        contract.recurrence === 'every_two_weeks'   && contract.dayDue > 14 || 
        contract.recurrence === 'monthly'           && contract.dayDue > 31)
        next(new Error('Recurrence and dayDue not matching!'))

    // Get contract's category by its title
    await contract.findCategory()

    next()
})

// Run after new contract was saved
contractSchema.post('save', async contract => {
    const transactions = Transaction.countDocuments({ _id: contract._id })

    if (transactions) { // If it's a pre-existing contract
        try {
            await contract.updateTransactions()
        } catch (e) {
            throw new Error('Error while updating transactions!')
        }
    } else { // If it's a new contract
        try {
            await contract.createTransactions()
        } catch (e) {
            await Contract.deleteOne({ _id: contract._id })
            throw new Error('Error while saving transactions. Contract not created!')
        }
    }
})

// Run before delete a contract
contractSchema.pre('findOneAndDelete', async function (next) {
    const contract = await this.model.findOne(this.getQuery())

    // Delete all future transactions
    try {
        const today = new Date()
        today.setHours(0)
        today.setMinutes(0)
        today.setSeconds(0)
        today.setMilliseconds(0)

        await Transaction.deleteMany({ contract: contract._id, date: { $gte: today } })

        next()
    } catch (e) {
        next(new Error('Error while deleting future transactions!'))
    }
})

const Contract = mongoose.model('Contract', contractSchema)

module.exports = Contract