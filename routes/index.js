const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const Request = require('../models/Request')

router.get('/', ensureGuest, (req, res) => {
    res.render('login', {
        layout: 'login',
    }
    )
})

router.get('/dashboard', ensureAuth, async (req, res) => {
    try {
        const requests = await Request.find( { user: req.user.id }).lean()
        res.render('Dashboard', {
            name: req.user.firstName,
            requests
        })
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

module.exports = router