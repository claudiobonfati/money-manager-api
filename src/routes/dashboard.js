const express = require('express')
const auth = require('../middleware/auth')
const Contract = require('../models/contract')
const Transaction = require('../models/transaction')
const router = new express.Router()

router.post('/dashboard/:month', async (req, res) => {
    // let date = new Date()
    // let limitDate

    // if (req.params.month === 'current') {
    //   limitDate = date
    // } else {
    //   let year = date.getFullYear()
    //   limitDate = new Date(year, req.params.month, 0)
    // }

    // let income = await Contract.find({
    //   type: 'income'
    // }).populate({
    //   path: 'transactions',
    //   match: {
    //     date: {
    //       "$lt": limitDate
    //     }
    //   },
    //   select: "price"
    // })

    res.status(400).send();
})

module.exports = router