const express = require("express");
const dotenv = require("dotenv")
const morgan = require("morgan")
const mongoose = require('mongoose')
const app = express();
const connectDB = require('./config/db')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const path = require('path')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')

//body parser
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// Method override
app.use(
    methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
      }
    })
  )

//logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}
//load config
dotenv.config({ path: './config/config.env' })
connectDB();

//passport config
require('./config/passport')(passport)

//handlebar helpers
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs')


//handlebars
app.engine('.hbs', exphbs.engine({helpers: {
        formatDate,
        stripTags,
        truncate,
        editIcon,
        select
    }, 
        defaultLayout: 'main', extname: '.hbs'
    })
);

app.set('view engine', '.hbs')


//sessions middleware
app.use(session({
    secret: 'innocuous gator',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.MONGO_URI,})
}))

//passport middleware
app.use(passport.initialize())
app.use(passport.session())

//global var
app.use((req, res, next) =>{
    res.locals.user = req.user || null
    next()
})

//static folder
app.use(express.static(path.join(__dirname, 'public')))

//routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/requests', require('./routes/requests'))

const PORT = process.env.PORT || 3000
app.listen(
    PORT, console.log(`server is running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);