const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const isMongoId = require('validator/lib/isMongoId');
const auth = require('../utils/verifyToken');
const Photos = require('../models/photo');
const { isUndefined, isString } = require('lodash');
const { nextTick } = require('process');

const app = express.Router();


app.get('/all', auth, async( req, res, next)=>{
    try {
        const { _id } = req.user;

        if(!_id && !isMongoId(_id)) {
            const err = new Error('Invalid user id');
			return res.status(400).json(err.message);
        }

        const photos = await Photos.find({ _id: _id },
            {
                photo: 1,
                createdAt: 1 
            }
        );
        return res.status(200).send(photos);

    } catch (err) {
        return next(err);
    }
});

app.put('/:id/edit', auth, async(req,res,next)=> {
    try {
        const { id } = req.params.id;

        const { categories, representation, styleRepresentation } = req.body;

        if(!id && !isMongoId(id)) {
            const err = new Error('Invalid photo id');
			return res.status(400).json(err.message);
        }

        const edited = await Photos.find({
            _id: id
        }, {
            representation: 1,
            styleRepresentation: 1
        });

        let sumFunction = async function (a, b)
        {
            return a + b
        }
        
        // Check the style representation percentage total
        const stylePercentage = edited.styleRepresentation.allocation + req.body.stylePercentage.allocation;
        let styleSum = 0, representationSum = 0;
        stylePercentage.forEach(async (percentage) => {
           
           styleSum = await sumFunction(styleSum, percentage)
        });

        if(styleSum>100) {
            return `Percentage Allocation Total for style representation cannot be more than 100%`;
        }

        //Check the representation percentage
        const representationPercentage = edited.representation.allocation + req.body.representation.allocation;
        representationPercentage.forEach(async(percentage)=>{
            representationSum = await sumFunction(representationSum, percentage);
        });

        if( representationSum>100) {
            return `Percentage allocation for representation cannot be more than 100%`;
        }

        await Photos.findOneAndUpdate({_id: id},
            {
                categories,
                representation,
                styleRepresentation
            });

            res.status(200).redirect('/all');
    } catch (err) {
        return next(err);
    }
});

app.post('/photo/add', auth, async(req, res, next) => {
    try {
        const { photo, representation, styleRepresentation } = req.body;

        let sumFunction = async function (a, b)
        {
            return a + b
        }

        const representationSum = req.body.representation.allocation;
        const styleSum = req.body.representation.allocation;
        if(!photo || !isString(photo)){
            const err = new Error('Please add a photo');
            return res.status(400).json(err.message);
        }

        if(!representation || representationSum>100 ){
            const err = new Error('representation sum cannot be more than 100');
            return res.status(400).json(err.message);
        }

        if(!styleRepresentation || styleSum>100){
            const err = new Error('style representation sum cannot be more than 100');
            return res.status(400).json(err.message);
        }

        const post = await Photos.create({
            photo,
            representation,
            styleRepresentation
        });
        return res.status(200).json(post);

    } catch (err) {
        return next(err);
    }
});