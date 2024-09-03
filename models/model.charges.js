const mongoose = require('mongoose');

const charges = mongoose.Schema({
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    charge: { type: Number, required: true }
  }, { _id: false });

  const ChargesSchema = mongoose.Schema(
    {
        IN_OUT: [charges],
        LOAD: [charges],
    }
  );

const Charges = mongoose.model("Charges", ChargesSchema)

module.exports = Charges