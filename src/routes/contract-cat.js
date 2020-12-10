const express = require('express')
const ContractCat = require('../models/contract-cat')
const auth = require('../middleware/auth')
const router = new express.Router()

// Create contract's categories
router.post('/contractCats', auth, async (req, res) => {
    try {
        const contractCat = new ContractCat(req.body)

        await contractCat.save()
        res.status(201).send(contractCat)
    } catch (e) {
        res.status(400).send()
    }
})

// gget contract's categories
router.get('/contractCats', auth, async (req, res) => {
    try {
        const ContractCats = await ContractCat.find({})

        res.send(ContractCats)
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router