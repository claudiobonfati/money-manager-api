const express = require('express')
const ContractCatTerm = require('../models/contract-cat-term')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/contractCatTerms', auth, async (req, res) => {
    try {
        const contractCatTerm = new ContractCatTerm(req.body)

        await contractCatTerm.save()
        res.status(201).send(contractCatTerm)
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/contractCatTerms', auth, async (req, res) => {
    try {
        const ContractCatTems = await ContractCatTerm.find({})

        res.send(ContractCatTems)
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router