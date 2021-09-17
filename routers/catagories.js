const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();


// get request for all categories in the db
router.get('/', async (req, res) => {
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({ sucess: false});
    };

    res.status(200).send(categoryList);
});


// get request for single categorie based on id parameter in the url
router.get('/:id', async(req, res) => {
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(500).json({ message: 'The category with the given ID was not  found.'})
    }
    res.status(200).send(category);
});

// creating a category and adding it to the db
router.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    category = await category.save();

    if(!category){
        return res.status(404).send('The category could be created!');
    };

    res.send(category);
});

// updating a specific category 
router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id, 
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },
        { new: true }
    );

    if(!category) {
        return res.status(400).send('the category cannot be updated');
    }

    res.status(200).send(category);
});


router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if(category) {
            return res.status(200).json({ success: true, message: 'the category was deleted.'})
        } else {
            return res.status(404).json.apply({success: false, message: "category not found"})
        }
    }).catch( err => {
        return res.status(400).json({success: false, error: err });
    });

});

module.exports = router;