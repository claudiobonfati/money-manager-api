const mongoose = require('mongoose')

// Category's terms collection schema
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
}, {
    timestamps: true
})

const CatTerm = mongoose.model('Contract-Cat-Term', catTermSchema)

module.exports = CatTerm