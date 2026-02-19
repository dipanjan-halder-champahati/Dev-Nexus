import express from 'express';
import {ENV} from './lib/env.js'
import path from 'path';
import { connectDB } from './lib/db.js';

const app= express();
const __dirname = path.resolve();
app.get('/health',(req,res)=>{
    res.status(200).json({message:"Hello World"});
});

app.get('/books',(req,res)=>{
    res.status(200).json({message:"Hello Sudip"});
});

//make our app ready for development

if(ENV.NODE_ENV === 'production') {
    app.use (express.static(path.join(__dirname,"../frontend/dist")))

    app.get("/{*any}", (req,res)=> {
        res.sendFile(path.join(__dirname,"../frontend/dist/index.html"))
    })
}

const port = ENV.PORT || 3000;
;

    const StartServer = async()=>{
        try{
            await connectDB();
            console.log("Server is running on port " + port);
        }catch(err){
            console.log("Failed to connect to the db ❌",err);
            process.exit(1); //0 success  1 failure
        }
    };

    StartServer();