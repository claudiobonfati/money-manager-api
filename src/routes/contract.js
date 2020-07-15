const express = require('express')
const Contract = require('../models/contract')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/contracts', auth, async (req, res) => {
    try {
        if (req.body.recurrence === 'once' &&
            req.body.installments !== 1) {
            return res.status(400).send({ error: 'Invalid fields' })
        }

        if (req.body.recurrence === 'weekly' && req.body.dayDue > 7 || 
            req.body.recurrence === 'every_two_weeks' && req.body.dayDue > 14 || 
            req.body.recurrence === 'monthly' && req.body.dayDue > 31) {
            return res.status(400).send({ error: 'Invalid fields' })
        }

        const contract = new Contract({
            ...req.body,
            owner: req.user._id 
        })

        await contract.save()

        res.status(201).send(contract)
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

router.patch('/contracts/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const updatesAllowed = [ 'title', 'price', 'recurrence', 'installments', 'dayDue' ]
    const canUpdate = updates.every(update => updatesAllowed.includes(update))

    if (!canUpdate)
        return res.status(400).send({ error: 'Invalid fields' })

    try {
        if (req.body.recurrence === 'once' &&
            req.body.installments !== 1)
            return res.status(400).send({ error: 'Invalid fields' })

        if (req.body.recurrence === 'weekly' && req.body.dayDue > 7 || 
            req.body.recurrence === 'every_two_weeks' && req.body.dayDue > 14 || 
            req.body.recurrence === 'monthly' && req.body.dayDue > 30)
            return res.status(400).send({ error: 'Invalid fields' })

        const contract = await Contract.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body, { new: true } )

        if (!contract)
            return res.status(404).send()

        res.send(contract)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router