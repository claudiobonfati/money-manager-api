const jwt = require('jsonwebtoken')
const User = require('../models/user')

// User has only 3 chances of using EasyLogin functionality.
// If it tries more than 3 times, the token is deleted and
// the NormalLogin is going to be used instead.
const authEasyLogin = async (req, res, next) => {
    // Check token existence
    if (!req.body.easylogin_token) 
        return res.status(400).send({ error: 'easylogin_expired' });

    try {
        // Validate token
        const token = req.body.easylogin_token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const users = await User.find({ 
            _id: decoded._id, 
            'tokens.token': token,
            'tokens.status': 'trashed'
        })

        if (users.length === 0)
            throw new Error()

        const user = users[0]

        // Update counter for access attempts
        let tokenIndex = user.tokens.findIndex((obj => obj.token == token))
        user.tokens[tokenIndex].easy_login_count += 1
        await user.save()

        // Validate attempts limit
        if (user.tokens[tokenIndex].easy_login_count > 2) {
            user.tokens.splice(tokenIndex, 1);

            await user.save()

            throw new Error()
        }

        next()
    } catch (e) {
        res.status(401).send({ error: 'easylogin_expired' })
    }
}

module.exports = authEasyLogin