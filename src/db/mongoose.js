const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/money-manager-api', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})