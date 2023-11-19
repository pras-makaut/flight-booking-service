const {BookingService} = require('../services');
const {StatusCodes} = require('http-status-codes')
const AppError = require('../utils/errors/app-error');
const {ErrorResponse ,SuccessResponse} = require('../utils/common');
async function createBooking(req,res){
    try {
        const resposne = await BookingService.createBooking({
            flightId:req.body.flightId,
            userId:req.body.userId,
            noOfSeats:req.body.noOfSeats
        })
        SuccessResponse.message ="Successfully crated a Booking";
        SuccessResponse.data = resposne;
        return res.
                status(StatusCodes.CREATED).
                json(SuccessResponse);
        
    } catch (error) {
        console.log(error)
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }

}
module.exports = {
    createBooking
}