var express = require('express');
var router = express.Router();

let nft = require('../controllers/nft');

/* GET home page. */
router.get('/nft-detail/:tx_id', nft.detail);

module.exports = router;