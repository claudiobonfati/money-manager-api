const express = require('express')
const Contract = require('../models/contract')
const ContractCat = require('../models/contract-category')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/contracts', auth, async (req, res) => {
    try {
        if (req.body.recurrence === 'once' &&
            req.body.installments !== 1) {
            throw new Error()
        }

        if (req.body.recurrence === 'weekly' && req.body.dayDue > 7 || 
            req.body.recurrence === 'every_two_weeks' && req.body.dayDue > 14 || 
            req.body.recurrence === 'monthly' && req.body.dayDue > 30) {
            throw new Error()
        }

        const contract = new Contract({
            ...req.body,
            owner: req.user._id 
        })

        await contract.save()
        res.status(201).send("contract")
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

router.post('/contract/categories', auth, async (req, res) => {
    try {
        const category = new ContractCat(req.body)

        await category.save()
        res.status(201).send(category)
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router