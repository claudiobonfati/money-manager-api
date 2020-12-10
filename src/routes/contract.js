const express = require('express')
const Contract = require('../models/contract')
const auth = require('../middleware/auth')
const router = new express.Router()

// Create contracts
router.post('/contracts', auth, async (req, res) => {
    try {
        const contract = new Contract({
            ...req.body,
            owner: req.user._id 
        })

        await contract.save()

        res.status(201).send(contract)
    } catch (e) {
        res.status(400).send()
    }
})

// Update contract's details
router.patch('/contracts/:id', auth, async (req, res) => {
    // (Security) Validate data to be updated
    const updates = Object.keys(req.body)
    const updatesAllowed = ['title', 'price', 'recurrence', 'instalments', 'dayDue']
    const canUpdate = updates.every(update => updatesAllowed.includes(update))

    // Exit if user try to update restricted info
    if (!canUpdate)
        return res.status(400).send({ error: 'Invalid fields' })

    // Run update
    try {
        const contract = await Contract.findOne({ _id: req.params.id, owner: req.user._id })

        if (!contract)
            return res.status(404).send()

        updates.forEach(key => contract[key] = req.body[key])

        await contract.save()

        res.send(contract)
    } catch (e) {
        res.status(400).send()
    }
})

// Delet contract (will keep old transactions, deleting only future transactions)
router.delete('/contracts/:id', auth, async (req, res) => {
    try {
        const contract = await Contract.findOneAndDelete({ _id: req.params.id, owner: req.user._id } )

        if (!contract)
            return res.status(404).send()

        res.send(contract)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router