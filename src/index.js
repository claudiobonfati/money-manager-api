const express = require('express')
require('./db/mongoose')
const userRouter = require('./routes/user')
const transactionRouter = require('./routes/transaction')
const contractRouter = require('./routes/contract')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(transactionRouter)
app.use(contractRouter)

app.listen(port, () => {
    // console.log(`Server is up on ${port}`)
})