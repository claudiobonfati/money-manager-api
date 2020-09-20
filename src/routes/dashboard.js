const express = require('express')
const auth = require('../middleware/auth')
const Contract = require('../models/contract')
const Transaction = require('../models/transaction')
require('../helpers/async-foreach')
const router = new express.Router()

router.post('/dashboard', auth, async (req, res) => {
    // let date = new Date()
    let year = parseInt(req.body.year)
    let month = parseInt(req.body.month)
    let day = parseInt(req.body.day)

    let startDate = new Date(year, month, 1)
    let limitDate = new Date(year, month, day + 1)
    
    // Store all transactions until given month
    let incomeTransactions = []
    let expenseTransactions = []

    // Store all this month transactions until given day
    let transactionsMonth = []

    // Get all transactions to sum incomes and expenses
    let allContracts = await Contract.find({ owner: req.user._id })
    .select('transactions type')
    .populate({
      path: 'contract',
      select: "icon -_id"
    })
    .populate({
      path: 'transactions',
      match: {
        date: {
          $lt: limitDate
        }
      },
      select: "date price -_id -contract"
    })
    .lean()

    // Sum incomes and expenses
    await allContracts.forEachAsync(contract => {
      if (contract.type === 'income') {
        incomeTransactions = incomeTransactions.concat(contract.transactions)
      } else if (contract.type === 'expense') {
        expenseTransactions = expenseTransactions.concat(contract.transactions)
      }
    })

    let incomePrices = incomeTransactions.map(i => i.price)
    let expensePrices = expenseTransactions.map(i => i.price)

    incomeTotal = incomePrices.reduce((a, b) => a + b, 0)
    expenseTotal = expensePrices.reduce((a, b) => a + b, 0)

    // Get all transactions within this month to mount dashboard
    let monthContracts = await Contract.find({ owner: req.user._id })
    .select('title transactions type')
    .populate({
      path: 'contract',
      select: "icon -_id"
    })
    .populate({
      path: 'transactions',
      match: {
        date: {
          $gte: startDate,
          $lt: limitDate
        }
      },
      select: "date price -_id -contract"
    })
    .lean();

    // Make month's transactions data readble
    await monthContracts.forEachAsync(contract => {
      contract.transactions = contract.transactions.map(i => (
        {
          ...i, 
          title: contract.title, 
          type: contract.type
        }
      ));

      transactionsMonth = transactionsMonth.concat(contract.transactions)
    })

    // Feedback
    res.status(200).send({incomeTotal, expenseTotal, transactionsMonth});
})

module.exports = router