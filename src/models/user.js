const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./transaction')

// Users collection schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Too short password'],
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    birthday: {
        type: Date,
        required: false,
        validate(value) {
            const today = new Date()
            
            if (new Date(value).getTime() >= today.getTime()) {
                throw new Error('Invalid birthday date')
            }
        }
    },
    avatar: {
        type: Buffer,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: {
                values: [ 
                    'active', 
                    'trashed' 
                ],
            },
            required: true
        },
        easy_login_count: {
            type: Number,
            required: true,
            default: 0,
        }
    }]
}, {
    timestamps: true
})

// Custom Schema functions
userSchema.statics.findByCredentials = async (email, password, _id) => {
    let user = null

    if (_id) {
        user = await User.findOne({ _id, email })
    } else {
        user = await User.findOne({ email })
    }

    if (!user)
        throw new Error({ error: 'Unable to login!' })

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid)
        throw new Error({ error: 'Unable to login!' })

    return user
}

userSchema.statics.findByIdAndPass = async (_id, password) => {
    const user = await User.findById(_id)

    if (!user)
        throw new Error({ error: 'Unable to login!' })

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
        throw new Error({ error: 'Unable to login!' })
    }

    return user
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token, status: 'active' })
    await user.save()

    return token
}

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.createdAt
    delete userObject.updatedAt
    delete userObject.__v

    userObject.avatar = `users/${userObject._id}/avatar`

    return userObject
}

userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.pre('remove', async function (next) {
    const user = this

    await Task.deleteMany({ owner: user._id })

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User