const express = require('express');
const router = express.Router();
const tvShowController = require('../controllers/tvshowController');


router.get('/', tvShowController.getAllTVShows);


router.get('/:id', tvShowController.getTVShowById);


router.post('/', tvShowController.createTVShow);


router.put('/:id', tvShowController.updateTVShow);

router.delete('/:id', tvShowController.deleteTVShow);

module.exports = router;
