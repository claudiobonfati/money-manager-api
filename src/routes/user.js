const express = require('express')
const ObjectId = require('mongodb').ObjectID
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const Contract = require('../models/contract')
const auth = require('../middleware/auth')
const router = new express.Router()
require('../helpers/async-foreach')

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()        
        res.status(201).send({ user, token })
    } catch(e) { 
        res.status(400).send()
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/loginEasy', (req, res) => {
    if (!req.body._id) 
        return res.status(400).send()

    req.body._id = new ObjectId(req.body._id) 

    let mount = (list, n = 0, passwords = [], current = []) => {
        if (n === list.length) passwords.push(current)
        else list[n].forEach(item => mount(list, n+1, passwords, [...current, item]))

        return passwords
    };

    let passwords = mount(req.body.password);

    const testPassword = async (arr) => {
        let counter = 1
        let total = arr.length

        for (let pass of arr) {
            let myPass = pass.join('')
            try {
                const user = await User.findByIdAndPass(req.body._id, myPass)
                const token = await user.generateAuthToken()
                
                res.status(201).send({ user, token })
                return true
            } catch(e) {
                if (counter === total) {
                    console.log(e)
                    res.status(400).send()
                }
            }

            counter++
        }

        return false;
    };

    testPassword(passwords)
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];

        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.get('/users/me/wallet', auth, async (req, res) => {
    let limitDate = new Date()
    // Store all transactions until given month
    let incomeTransactions = []
    let expenseTransactions = []

    // Get amount of transactions
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
    
    let incomeTotal = incomePrices.reduce((a, b) => a + b, 0)
    let expenseTotal = expensePrices.reduce((a, b) => a + b, 0)

    res.send({
        transactions: incomeTransactions.length + expenseTransactions.length,
        inWallet: incomeTotal - expenseTotal
    })
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const updatesAllowed = [ 'name', 'birthday' ]
    const canUpdate = updates.every(update => updatesAllowed.includes(update))

    if (!canUpdate) {
        return res.status(400).send({ error: 'Invalid fields' })
    }

    try {
        updates.forEach(key => req.user[key] = req.body[key])

        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try { 
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500). send()
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(png|jpeg|jpg)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 300, height: 300 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()   
}, (error, req, res, next) => {
    res.status(404).send({ error: error.message })
})

router.get('/users/me/avatar', auth, async (req, res) => {
    if(!req.user.avatar) {
        const buffer = await sharp('src/images/mascot.svg').png().toBuffer()
        res.set('Content-Type', 'image/png').send(buffer)
    } else {
        res.set('Content-Type', 'image/png').send(req.user.avatar)
    }
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar)
            throw new Error()

        res.set('Content-Type', 'image/png').send(user.avatar)
    } catch (e) {
        const buffer = await sharp('src/images/mascot.svg').png().toBuffer()
        res.set('Content-Type', 'image/png').send(buffer)
    }
})

router.post('/users/presentation', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })

        if (!user)
            throw new Error()

        res.send(user)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router