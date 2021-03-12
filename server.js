const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT REJECTION! Shutting down....');
    console.log(err.name, err.message);
    process.exit(1);
});

//console.log(process.env);

dotenv.config({path: './config.env'});
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
.connect(DB, { 
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
.then(con => {
    //console.log(con.connections);
    console.log('DB Connection successfull');
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}`)
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! Shutting down....');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// for heroku (every 24h heroku sends SIGTERM)
process.on('SIGTERM', () => {
    console.log('SIGTERM REVEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('Process terminated!')
    });
});