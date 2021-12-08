const {Store} = require('../models/store');
const express = require('express');
const router = express.Router();


// get request for all stores in the db
router.get('/', async (req, res) => {
    const storeList = await Store.find();

    if(!storeList) {
        res.status(500).json({ sucess: false});
    };

    res.status(200).send(storeList);
});


// get request for single store based on id parameter in the url
router.get('/:id', async(req, res) => {
    const store = await Store.findById(req.params.id);

    if(!store) {
        res.status(500).json({ message: 'The store with the given ID was not  found.'})
    }
    res.status(200).send(store);
});

// creating a store and adding it to the db
router.post('/', async (req, res) => {
    let store = new Store({
        name: req.body.name,
        phone: req.body.phone,
        icon: req.body.icon,
        color: req.body.color
    })
    store = await store.save();

    if(!store){
        return res.status(404).send('The store could be created!');
    };

    res.send(store);
});

// updating a specific store 
router.put('/:id', async (req, res) => {
    const store = await Store.findByIdAndUpdate(
        req.params.id, 
        {
            name: req.body.name,
            phone: req.body.phone,
            icon: req.body.icon,
            color: req.body.color
        },
        { new: true }
    );

    if(!store) {
        return res.status(400).send('the store cannot be updated');
    }

    res.status(200).send(store);
});

// deleting a specific store
router.delete('/:id', (req, res) => {
    Store.findByIdAndRemove(req.params.id).then(store => {
        if(store) {
            return res.status(200).json({ success: true, message: 'the store was deleted.'})
        } else {
            return res.status(404).json.apply({success: false, message: "store not found"})
        }
    }).catch( err => {
        return res.status(400).json({success: false, error: err });
    });

});

module.exports = router;