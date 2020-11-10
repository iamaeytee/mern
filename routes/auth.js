const express = require('express');
const passport = require('passport')
const User = require('../../models/User');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const { generateHash, compareHash } = require('../../utils/hash');
const { isString, isUndefined } = require('lodash');

const router = express.Router();

router.post('/register', async (req, res, next) => {
   try{ 
    const { name, mobile, emailID, password } = req.body;
    

    //Validation name
    if(!name || !isString(name) || name.length<3){
        const error = new Error('Invalid Name');
        error.name = 'Validation Error';
        return res.status(400).send('Please enter a valid name');
    }

    //Validation mobile
    if(!isUndefined(mobile) && !isFinite(mobile) || !validator.isMobilePhone(`${mobile}`, 'en-IN')){
        const error = new Error('Invalid Contact number');
        error.name= 'Validation Error';
        return res.status(400).send('Please enter a valid mobile number');
    }

    //Validation Password
    if (
        !isString(password) ||
        password.length < 8 ||
        password.length > 30
    ) {
        const err = new Error('Invalid password. Password should be 8 to 30 characters long');
        err.name = 'ValidationError';
        return res.status(400).json(err.message);
    }

    //Validation Email
    if (!isString(emailID) || !validator.isEmail(emailID)) {
        const err = new Error('Invalid email id');
        err.name = 'ValidationError';
        return res.status(400).json(err.message);
    }

    const userExist = await User.findOne(
        {
        $or:[
            { emailID },
            { mobile }
        ]
    },
    {
        _id: 0,
        emailID: 1,
        mobile: 1
    }
    );
    
    if(userExist){
        // Throw error if email is already linked to a user's account
        if(userExist.emailID === emailID){
            const err = new Error('Email is already linked to a account');
            err.name = 'Validation Error';
            return res.status(400).json(err.message);
        }

        // Throw error if Phone number is linked with some account
        if(userExist.mobile === mobile){
            const err = new Error('Provided Phone number is linked with some account');
            err.name = 'ValidationError';
            return res.status(400).json(err.message);
        }
    }

    const user = await User.create({
        name,
        mobile,
        emailID,
        password: await generateHash(password)
    })

    res.redirect('/login');
} catch(err){
    return next(err);
}
});

router.post('/login', async(req, res, next) => {
    try {
        const { mobile, password } = req.body;

        //Validation mobile
        if(!isUndefined(mobile) && !isFinite(mobile) || !validator.isMobilePhone(`${mobile}`, 'en-IN')){
            const error = new Error('Invalid Contact number');
            error.name= 'Validation Error';
            return res.status(400).send('Please Provide a valid mobile number');
        }
        
        //Validation Password
        if (
            !isUndefined(password) &&
            (!isString(password) ||
                password.length < 8 ||
                password.length > 30)
        ) {
            const err = new Error('Password should contain minimum 8 and maximum 30 characters');
            err.name = 'ValidationError';
            return res.status(400).json(err.message);
        }

        const user = await User.findOne(
            { mobile: mobile },
            { 
              mobile: 1,
              emailID: 1,
              password: 1
            }
        )

        if (!isUndefined(mobile)) {
            // Throw error if the user with the email is not found
            if (!user) {
                const err = new Error('No account linked with this mobile number');
                err.name = 'ValidationError';
                return res.status(400).json(err.message);
            }

            if (!isUndefined(password)) {
				// Throw error if user has no password set up
				if (!user.password || isEmpty(user.password)) {
					const err = new Error(
						'Please try signing in social media'
					);
					err.name = 'PasswordNotSet';
					return res.status(400).json(err.message);
                }
                
            const same = await compareHash(
                password,
                user.password !== undefined ? user.password : ''
            );

            if (!same) {
                const err = new Error('Incorrect Credentials');
                err.name = 'ValidationError';
                return res.status(400).json(err.message);
            }

            }
        }

        const expirationDate = new Date(today);
        expirationDate.setDate(today.getDate() + 60);

        const token = jwt.sign({_id: user._id, exp: parseInt(expirationDate.getTime() / 1000, 10) }, process.env.SECRET_SIGNATURE);
        res.header('auth-token', token);
    } catch (err) {
        return next(err);
    }
});