//Imported express module in const app
const app = require('./app');

const connectDatabase = require('./config/database');

//module used to load/access environment variables
const dotenv = require('dotenv');

//Setting up config file
dotenv.config({path : 'backend/config/config.env'})

// Connecting to database
connectDatabase();

const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server started on PORT : ${process.env.PORT} in ${process.env.NODE_ENV} mode.
    `)
})

//Handling Unhandled Promise Rejection
process.on('unhandledRejection', err=>{
    console.log(`Error: ${err.message}`);
    console.log(`Server is shutting down due to unhandled Promise Rejection`);
    server.close(()=>{
        process.exit(1);
    })
})