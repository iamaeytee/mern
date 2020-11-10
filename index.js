const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
//Import Routes
const authRoutes = require('./routes/userapp/auth');
const passportSetup = require('./config/passport-setup')

dotenv.config();

//Connect to mongoose
mongoose.connect(
    process.env.DB_CONNECT,
    {useNewUrlParser: true},
    ()=> console.log('Connected to DB!')
);

//Middlewares
app.use(express.json());


//Routes Middlewares
app.use('/api/v1/', authRoutes);

app.listen(3000, ()=> console.log('Listening on 3000...'));