const axios = require('axios');
const {BookingRepository} = require('../repositories');
const db = require('../models');
const {ServerConfig} = require('../config')
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

async function createBooking(data){
    try {
        const result = await db.sequelize.transaction(async function bookingImple(t){
            const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
            const flightData = flight.data;
            if(data.noOfSeats > flightData.data.totalSeats){
                throw new AppError('Required no of seat not available',StatusCodes.BAD_REQUEST);
            }
            return true;
        } )
        
    } catch (error) {
        console.log(error);
        throw error;
        
    }
}

module.exports = {
    createBooking
    
}