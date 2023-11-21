const {StatusCodes} = require('http-status-codes');
const CrudRepository = require('./crud-repository');

const {Booking} = require('../models');
const { Op } = require('sequelize');
const {Enums} = require('../utils/common')
const {BOOKED,CANCELLED} = Enums.BOOKING_STATUS;
class BookingReapositry extends CrudRepository{
    constructor (){
        super(Booking)
    }

    async createBooking(data,transaction){
        const response =  await Booking.create(data,{transaction:transaction});
        return response;
    }

    async get(data,transaction){
        const resposne = await this.model.findByPk(data,{transaction:transaction});
        if(!resposne){
            throw new AppError('this id which you sent not present in databse',StatusCodes.NOT_FOUND);
        }
        return resposne;
    }
    async update(id,data,transaction){
        const resposne = await this.model.update(data,{
            where: {
                id:id
            } 
        },{transaction:transaction});
        if(resposne==0){
            throw new AppError('this id which you want to update not present in databse',StatusCodes.NOT_FOUND);
        }

        return resposne;
    }

    async cancelOldBookings(timestamp){
        const response = await Booking.update({status:CANCELLED},{
            where:{
                [Op.and]:[
                    {
                        createdAt:{
                            [Op.lt]:timestamp
                        }
                    },
                    {
                        status:{
                            [Op.ne]:BOOKED
                        }
                        
                    },
                    {
                        status:{
                            [Op.ne]:CANCELLED
                        }
                        
                    }
                ]
            }
        })
        return response;
    }
}

module.exports = BookingReapositry;