const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const Request = require('../models/Request')

//show add page
router.get('/add', ensureAuth, (req, res) => {
    res.render('requests/add')
})

//process add form. sends to mongoDB
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Request.create(req.body)
        res.redirect('/dashboard')

    } catch (error) {
        console.log(error)
        res.render('error/500')
    }
})

//show all requests
router.get('/', ensureAuth, async(req, res) => {
    try {
        const requests = await Request.find({ status: 'public'})
            .populate('user')
            .sort({ createdAt: 'desc'})
            .lean()
        res.render('requests/index', {
            requests,
        })
    } catch (error) {
        console.log(error)
        res.render('error/500')
        
    }
})

//show single request
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let request = await Request.findById(req.params.id)
        .populate('user')
        .lean()
        if(!request){
            return res.render('error/404')
        }
        res.render('requests/show', {
            request
        })
    } catch (error) {
        console.log(error)
        res.render('error/404')
    }
})


// Show edit page
router.get('/edit/:id', ensureAuth, async (req, res) => {
      const request = await Request.findOne({
        _id: req.params.id,
      }).lean()
  
      if (!request) {
        return res.render('error/404')
      }
  
      if (request.user != req.user.id) {
        res.redirect('/request')
      } else {
        res.render('requests/edit', {
          request,
        })
      }
  })

//update request
router.put('/:id', ensureAuth, async(req, res) => {
    let request = await Request.findById(req.params.id).lean()
    if(!request){
        return res.render('error/404')
    } 
    if(request.user != req.user.id){
        res.redirect('/requests')
    } else{
        request = await Request.findOneAndUpdate({ _id: req.params.id}, req.body, {
            new: true,
            runValidators: true
        })
        res.redirect('/dashboard')
    }
})

//delete request
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
       await Request.remove({ _id: req.params.id }) 
       res.redirect('/dashboard')
    } catch (error) {
        console.log(error)
        return res.render('error/500')
    }
})
//user requests
router.get('/user/:userId', ensureAuth, async(req, res) => {
    try {
        const requests = await Request.find({
            user: req.params.userId,
            status: 'private'
        })
        .populate('user')
        .lean()
        res.render('requests/index', {
            requests
        })
        
    } catch (error) {
        console.log(error)
        res.render('error/500')
    }
})

module.exports = router