"use strict";
const mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const user = new mongoose.Schema(
  {
    walletaddress: { type: String, trim: true },
    email: { type: String, trim: true },
    password: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isValid: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);
user.pre("save", async function (next) {
  this.isModified("password") &&
    (this.password = await bcrypt.hash(this.password, 10));
  next();
});
module.exports = mongoose.model("user", user);
