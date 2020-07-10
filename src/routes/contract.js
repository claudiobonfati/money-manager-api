const express = require('express')
const Contract = require('../models/contract')
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
            req.body.recurrence === 'monthly' && req.body.dayDue > 31) {
            throw new Error()
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


// router.patch('/contracts/:id', auth, async (req, res) => {
//     const updates = Object.keys(req.body)
//     const updatesAllowed = [ 'description', 'completed' ]
//     const canUpdate = updates.every(update => updatesAllowed.includes(update))

//     if (!canUpdate) {
//         return res.status(400).send({ error: 'Invalid fields' })
//     }

//     try {
//         if (req.body.recurrence === 'once' &&
//             req.body.installments !== 1) {
//             throw new Error()
//         }

//         if (req.body.recurrence === 'weekly' && req.body.dayDue > 7 || 
//             req.body.recurrence === 'every_two_weeks' && req.body.dayDue > 14 || 
//             req.body.recurrence === 'monthly' && req.body.dayDue > 30) {
//             throw new Error()
//         }

//         const contract = new Contract({
//             ...req.body,
//             owner: req.user._id 
//         })

//         await contract.save()
//         res.status(201).send(contract)
//     } catch (e) {
//         console.log(e)
//         res.status(400).send()
//     }
// })

// router.patch('/transactions/:id', auth, async (req, res) => {
//     const updates = Object.keys(req.body)
//     const updatesAllowed = [ 'description', 'completed' ]
//     const canUpdate = updates.every(update => updatesAllowed.includes(update))

//     if (!canUpdate) {
//         return res.status(400).send({ error: 'Invalid fields' })
//     }

//     try {
//         const transaction = await Transaction.findOne({ _id: req.params.id, owner: req.user._id })

//         if (!transaction) {
//             return res.status(404).send()
//         }

//         updates.forEach(key => transaction[key] = req.body[key])

//         await transaction.save()

//         res.send(transaction)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

module.exports = router