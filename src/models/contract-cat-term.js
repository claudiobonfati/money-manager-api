const mongoose = require('mongoose')

const catTermSchema = new mongoose.Schema({
    term: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Contract-Cat'
    }
})


const CatTerm = mongoose.model('Contract-Cat-Term', catTermSchema)

module.exports = CatTerm