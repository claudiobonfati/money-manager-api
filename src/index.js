const cors = require('cors')
const express = require('express')
require('./db/mongoose')
const userRouter = require('./routes/user')
const contractRouter = require('./routes/contract')
const dashboardRouter = require('./routes/dashboard')

// Init server
const app = express()
app.use(cors())
const port = process.env.PORT

// Import routes handlers
app.use(express.json())
app.use(userRouter)
app.use(contractRouter)
app.use(dashboardRouter)

// Start server
app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})