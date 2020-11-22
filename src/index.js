const cors = require('cors')
const express = require('express')
require('./db/mongoose')
const userRouter = require('./routes/user')
const contractRouter = require('./routes/contract')
const contractCatRouter = require('./routes/contract-cat')
const contractCatTermRouter = require('./routes/contract-cat-term')
const dashboardRouter = require('./routes/dashboard')

const app = express()
app.use(cors())
const port = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(contractRouter)
app.use(contractCatRouter)
app.use(contractCatTermRouter)
app.use(dashboardRouter)

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})