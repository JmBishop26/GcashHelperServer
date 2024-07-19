const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;