"use strict";
const mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Transactions = new mongoose.Schema(
  {
    CryptonType: { type: String, trim: true },
    UserID: { type: String, trim: true },
    email: { type: String, trim: true },
    purchasedAmount: { type: String, trim: true },
    AmountTopay: { type: String, trim: true },
    Account: { type: String, trim: true },
    transactionHash: { type: String, trim: true },
    SendtokenByadmin: { type: Boolean, trim: true, default: false },
    SendtokenByadminHash: { type: String, trim: true, default: null },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Transactions", Transactions);
