const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var PriceSchema = new mongoose.Schema(
  {
    BUSDTprice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("BUSDTPrice", PriceSchema);
