"use strict";
const mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const user = new mongoose.Schema(
  {
    email: { type: String, trim: true },
    password: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("admin", user);
