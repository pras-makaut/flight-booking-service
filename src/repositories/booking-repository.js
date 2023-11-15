const {StatusCodes} = require('http-status-codes');
const CrudRepository = require('./crud-repository');

const {Booking} = require('../models')
class BookingReapositry extends CrudRepository{
    constructor (){
        super(Booking)
    }
}

module.exports = BookingReapositry;