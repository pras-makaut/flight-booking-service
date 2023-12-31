const express = require('express');
const {BookingController} = require('../../controllers')


const router = express.Router();
// api/v1/airports POST
router.post('/',BookingController.createBooking);

router.post('/payments',BookingController.makePayment);
module.exports = router;