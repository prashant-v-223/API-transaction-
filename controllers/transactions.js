const { ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");
const { findOneRecord, updateRecord } = require("../library/commonQueries");
const {
  successResponse,
  badRequestResponse,
  errorResponse,
  notFoundResponse,
} = require("../middleware/response");
const { tokenverify } = require("../middleware/token");
const admin = require("../models/admin");
const userdata = require("../models/user");
const transactions = require("../models/transactions");
const Pricemodal = require("../models/Price");
exports.transactions = {
  transactionsDone: async (req, res) => {
    try {
      if (req.headers.authorization) {
        let { err, decoded } = await tokenverify(
          req.headers.authorization.split(" ")[1]
        );
        if (err) {
          notFoundResponse(res, {
            message: "user not found",
          });
        }
        if (decoded) {
          let data = {
            UserID: decoded.profile._id,
            email: decoded.profile.email,
            ...req.body,
          };
          // const user = await findOneRecord(admin, {
          //   _id: decoded.profile._id,
          // });
          // if (user) {
          const isCreated = await transactions(data).save();
          return successResponse(res, {
            message: "transactions have been sent successfully",
          });
          // }
        }
      } else {
        badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  Alltransactions: async (req, res) => {
    try {
      if (req.headers.authorization) {
        let { err, decoded } = await tokenverify(
          req.headers.authorization.split(" ")[1]
        );
        if (err) {
          notFoundResponse(res, {
            message: "user not found",
          });
        }
        const user = await findOneRecord(admin, {
          _id: decoded.profile._id,
        });
        if (decoded) {
          if (user) {
            const isCreated = await transactions.find({});
            return successResponse(res, {
              message: "transactions get successfully",
              data: isCreated,
            });
          } else {
            badRequestResponse(res, {
              message: "do not have access for admin panal",
            });
          }
        }
      } else {
        badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  usertransactions: async (req, res) => {
    try {
      if (req.headers.authorization) {
        let { err, decoded } = await tokenverify(
          req.headers.authorization.split(" ")[1]
        );
        if (err) {
          notFoundResponse(res, {
            message: "user not found",
          });
        }
        const user = await findOneRecord(userdata, {
          _id: decoded.profile._id,
        });
        if (decoded) {
          if (user) {
            const isCreated = await transactions.find({
              UserID: decoded.profile._id,
            });
            return successResponse(res, {
              message: "transactions get successfully",
              data: isCreated,
            });
          } else {
            badRequestResponse(res, {
              message: "do not have access for admin panal",
            });
          }
        }
      } else {
        badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  priceBNB: async (req, res) => {
    try {
      await updateRecord(
        Pricemodal,
        {},
        {
          BNBprice: req.body.BNBprice,
        }
      );
      return successResponse(res, {
        message: "Price chenge successfully",
      });
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  priceUSDT: async (req, res) => {
    try {
      await updateRecord(
        Pricemodal,
        {},
        {
          BUSDTprice: req.body.BUSDTprice,
        }
      );
      return successResponse(res, {
        message: "Price chenge successfully",
      });
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  getallPrice: async (req, res) => {
    try {
      let data = await Pricemodal.find({});
      return successResponse(res, {
        message: "Price chenge successfully",
        data: data,
      });
    } catch (error) {
      return errorResponse(error, res);
    }
  },
};
