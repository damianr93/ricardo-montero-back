import mongoose from "mongoose"


interface Options {
    mongoUrl: string,
    dbName: string
}

export class MongoDataBase {

    static async connect( opt:Options){

        const {mongoUrl, dbName} = opt;

        try {

            await mongoose.connect(mongoUrl,{
                dbName
            });
            
            return true

        } catch (error) {
            console.log('Mongo conection Error')
            throw error
        };

    };

    static async disconect() {
        await mongoose.disconnect();
    };
 
}