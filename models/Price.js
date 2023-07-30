const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var PriceSchema = new mongoose.Schema(
  {
    BNBprice: {
      type: Number,
      required: true,
    },
    BUSDTprice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("BNBPrice", PriceSchema);
