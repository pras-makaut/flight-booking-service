const axios = require('axios');
const {BookingRepository} = require('../repositories');
const db = require('../models');
const {ServerConfig,Queue} = require('../config')
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const {Enums} = require('../utils/common')
const {BOOKED,CANCELLED} = Enums.BOOKING_STATUS;


const bookingRepositoy = new BookingRepository();
async function createBooking(data){
    const transaction = await db.sequelize.transaction();
    try {
        const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
        console.log(flight)
        const flightData = flight.data.data;
        
        if(data.noOfSeats > flightData.totalSeats) {
            throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
        }
        const totalBillingAmount = data.noOfSeats * flightData.price;
        const bookingPayload = {...data, totalCost: totalBillingAmount};
        
        const booking = await bookingRepositoy.createBooking(bookingPayload, transaction);

        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {
            seats: data.noOfSeats
        });

        await transaction.commit();
        return booking;
    } catch(error) {
       
        await transaction.rollback();
        throw new AppError(error,StatusCodes.INTERNAL_SERVER_ERROR);
        
    }
}

async function makePayment(data){
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDeatils = await bookingRepositoy.get(data.bookingId,transaction);
        if(bookingDeatils.status == CANCELLED){
            throw new AppError('The booking has expired',StatusCodes.BAD_REQUEST);
        }
        const bookingTime = new Date(bookingDeatils.createdAt);
        const currentTime = new Date();
        if(currentTime - bookingTime > 300000){
            await cancelBooking(data.bookingId);
            throw new AppError('The booking has expired',StatusCodes.BAD_REQUEST);
        }
        if(bookingDeatils.totalCost != data.totalCost){
            throw new AppError('The amount of the payment does not match',StatusCodes.BAD_REQUEST);

        }
        if(bookingDeatils.userId != data.userId){
            throw new AppError('The user corrosponding to the booking does not match',StatusCodes.BAD_REQUEST);

        }
        // we assume here that payment is successfull 
        const response = await bookingRepositoy.update(data.bookingId,{status:BOOKED} ,transaction);
        Queue.sendData({
            recepientEmail:'ranjan.prashant3655@gmail.com',
            subject:'Flight Booked',
            text:`Booking successfully done for the flight ${data.bookingId}`
        })
        await transaction.commit();
        return response; 
    } catch (error) {
        await transaction.rollback();
        throw new AppError(error,StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function cancelBooking(bookingId){
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDeatils = await bookingRepositoy.get(bookingId,transaction);
        if(bookingDeatils.status == CANCELLED){
            await transaction.commit();
            return true;
        }
        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDeatils.flightId}/seats`, {
            seats: bookingDeatils.noOfSeats,
            dec:0
        });
        await bookingRepositoy.update(bookingId,{status:CANCELLED} ,transaction);
        await transaction.commit();
        
    } catch (error) {
        await transaction.rollback();
        throw new AppError(error,StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function cancelOldBookings(){
    
    try {
        const time = new Date(Date.now() - (5 * 60 * 1000));
        const response = bookingRepositoy.cancelOldBookings(time);
        console.log(response);
        return response;
    } catch (error) {
        
    }
}

module.exports = {
    createBooking,
    makePayment,
    cancelOldBookings
    
}