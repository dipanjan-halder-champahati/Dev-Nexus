import mongoose from 'mongoose';
import {ENV} from './env.js';

export const connectDB=async()=>{
    try{
        if(!ENV.DB_URL){
            throw new Error("DB_URL is not defined in the environment variables");
        }

        const conn = await mongoose.connect(ENV.DB_URL);
        console.log('connected to MongoDB✅');
    }catch(err){
        console.log("Failed to connect to the db ❌",err);
        process.exit(1); //0 success  1 failure
    }
}