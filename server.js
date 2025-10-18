const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥💥💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);     // then exiting the server
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {})
  // .connect(process.env.DATABASE_LOCAL, {})
  .then((con) => {
    console.log('DB connection successful');
  });
// .catch((err) => console.error('DB connection error:', err));  // now we are handling it by exiting the server (look at the function at last function)

// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥💥💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {   // first handling all the request still in the sever (shutting down gracefully)
    process.exit(1);     // then exiting the server
  });
});


