const {Logger } = require('../config');
const {StatusCodes} = require('http-status-codes');
const AppError = require('../utils/errors/app-error')
class CrudRepository{
    constructor(model){
        this.model=model;
    }

    async createData(data){
        
        const resposne = await this.model.create(data);
        return resposne;
        
    }

    async destroy(data){
        const resposne = await this.model.destroy({
            where:{
                id:data
            }
        });
        if(!resposne){
            throw new AppError('this id which you want to delete not present in databse',StatusCodes.NOT_FOUND);
        }
        return resposne;
    }
    async get(data){
        const resposne = await this.model.findByPk(data);
        if(!resposne){
            throw new AppError('this id which you sent not present in databse',StatusCodes.NOT_FOUND);
        }
        return resposne;
    }
    async getAll(){
    
        const resposne = await this.model.findAll();
        return resposne;
        
    }
    async update(id,data){
        const resposne = await this.model.update(data,{
            where: {
                id:id
            } 
        });
        console.log(resposne)
        if(resposne==0){
            throw new AppError('this id which you want to update not present in databse',StatusCodes.NOT_FOUND);
        }

        return resposne;
    }

}

module.exports = CrudRepository;