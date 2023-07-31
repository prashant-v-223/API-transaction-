var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
var ejs = require("ejs");
const jwt = require("jsonwebtoken");
const {
  decodeUris,
  cloneDeep,
  findOneRecord,
  updateRecord,
  hardDeleteRecord,
} = require("../library/commonQueries");
const {
  successResponse,
  badRequestResponse,
  errorResponse,
  notFoundResponse,
} = require("../middleware/response");
const Usermodal = require("../models/user");
const adminmodal = require("../models/admin");
const Token = require("../models/Token");
const {
  token,
  tokenverify,
  Forgetpasswordtoken,
} = require("../middleware/token");
const { Mailgun } = require("mailgun");
let transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

exports.register = {
  signUp: async (req, res) => {
    try {
      let uniqueRefid = await Date.now().toString(16).slice(2);
      req.body.refferalId = uniqueRefid;
      req.body = decodeUris(req.body);
      console.log(req.body);
      const refferalBygetdata = await findOneRecord(Usermodal, {
        username: req.body.refferalBy,
      });
      const walletaddress = await findOneRecord(Usermodal, {
        walletaddress: req.body.walletaddress,
      });
      if (walletaddress === null) {
        const userdata = await findOneRecord(Usermodal, {
          email: req.body.email,
          isActive: !false,
          isValid: !false,
        });
        if (userdata !== null) {
          return badRequestResponse(res, {
            message: "user is already exist.",
          });
        } else {
          await bcrypt.hash(req.body.password, 8).then(async (pass) => {
            await updateRecord(
              Usermodal,
              {
                email: req.body.email,
                isActive: !false,
                isValid: false,
              },
              {
                walletaddress: req.body.walletaddress,
                password: pass,
              }
            );
          });
          const data = await findOneRecord(Usermodal, {
            email: req.body.email,
            isActive: !false,
            isValid: false,
          });
          if (data !== null) {
            const profile = await Usermodal.findById(data._id).select({
              password: 0,
            });
            const accessToken = jwt.sign({ profile }, "3700 0000 0000 002", {
              expiresIn: "1hr",
            });
            return successResponse(res, {
              message: "registration successfully",
            });
          } else {
            const isCreated = await Usermodal({
              ...req.body,
            }).save();
            if (!isCreated) {
              return badRequestResponse(res, {
                message: "Failed to create register!",
              });
            } else {
              const profile = await Usermodal.findById(isCreated._id).select({
                password: 0,
              });
              const accessToken = jwt.sign({ profile }, "3700 0000 0000 002", {
                expiresIn: "1hr",
              });
              return successResponse(res, {
                message: "registration successfully",
              });
            }
          }
        }
      } else {
        validarionerrorResponse(res, {
          message: `please enter valid  walletaddress.`,
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  mailVarify: async (req, res) => {
    try {
      const { Token } = req.params;
      if (Token) {
        let { err, decoded } = await tokenverify(Token.split(":")[1]);
        if (err) {
          notFoundResponse(res, {
            message: "user not found",
          });
        }
        if (decoded) {
          decoded = await cloneDeep(decoded);
          updateRecord(
            Usermodal,
            { email: decoded.profile.email },
            {
              isValid: true,
            }
          );
          ejs.renderFile(
            __dirname + "/welcome.ejs",
            {
              name: "v4xverifyuser@gmail.com",
            },
            async function (err, data) {
              const DOMAIN = "donotreply@v4x.org";
              const mg = Mailgun({
                apiKey: "afd2a109fddce998ef411c7ac33c3e0c-81bd92f8-5473abd7",
                domain: DOMAIN,
              });
              const data111 = {
                from: "donotreply@v4x.org",
                to: decoded.profile.email,
                subject: "main varification",
                html: data,
              };
              mg.messages().send(data111, function (error, body) {
                console.log("body", body);
                console.log(error);
                if (!error) {
                  res.redirect("https://v4x.org/login?login#");
                } else {
                  return badRequestResponse(res, {
                    message: `Email not send error something is wrong ${err}`,
                  });
                }
              });
            }
          );
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
  signIn: async (req, res) => {
    try {
      req.body = decodeUris(req.body);
      const user = await findOneRecord(Usermodal, { email: req.body.email });
      if (!user) {
        notFoundResponse(res, { message: "User Not Found!" });
      } else {
        const match = await bcrypt.compare(req.body.password, user.password);
        if (
          !match &&
          user.password.toString() !== req.body.password.toString()
        ) {
          badRequestResponse(res, { message: "Password is incorrect!" });
        } else {
          if (!user.isActive) {
            badRequestResponse(res, {
              message: "Account is disabled. please contact support!",
            });
          } else {
            if (!user.isValid) {
              badRequestResponse(res, {
                message: "please verify your account",
              });
            } else {
              console.log(user);
              const accessToken = await token(Usermodal, user);
              return successResponse(res, {
                message: "Login successfully",
                token: accessToken.token,
                profile: user,
              });
            }
          }
        }
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  forgotPassword: async (req, res) => {
    try {
      req.body = decodeUris(req.body);
      const user = await findOneRecord(Usermodal, { email: req.body.email });
      if (!user) {
        notFoundResponse(res, { message: "User Not Found!" });
      } else {
        decoded = await cloneDeep(user);
        const accessToken = await Forgetpasswordtoken(Usermodal, decoded);
        let token = await Token.findOne({ userId: decoded._id });
        if (!token) {
          token = await new Token({
            userId: decoded._id,
            token: accessToken.token,
          }).save();
        } else {
          await updateRecord(
            Token,
            {
              userId: decoded._id,
            },
            {
              token: accessToken.token,
            }
          );
        }
        ejs.renderFile(
          __dirname + "/Forgetpassword.ejs",
          {
            from: "donotreply@v4x.org",
            action_url: accessToken.token,
          },
          async function (err, data) {
            const DOMAIN = "donotreply.v4x.org";
            const mg = Mailgun({
              apiKey: "afd2a109fddce998ef411c7ac33c3e0c-81bd92f8-5473abd7",
              domain: DOMAIN,
            });
            const data111 = {
              from: "donotreply@v4x.org",
              to: decoded["email"],
              subject: "main varification",
              html: data,
            };

            transport.sendMail(data111, (error, info) => {
              if (!error) {
                res.status(500).send(`Server error ${error}`);
              }
            });
            return successResponse(res, {
              message:
                "Forgot Password link has been send to your email address..!!",
            });
          }
        );
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  changePassword: async (req, res) => {
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
          let token = await Token.findOne({ userId: decoded.profile._id });
          if (!token) {
            return badRequestResponse(res, {
              message: "token is expires.",
            });
          }
          const { password } = req.body;
          decoded = await cloneDeep(decoded);
          await hardDeleteRecord(Token, {
            userId: decoded.profile._id,
          });
          await bcrypt.hash(password, 8).then((pass) => {
            updateRecord(
              Usermodal,
              { _id: decoded.profile._id },
              {
                password: pass,
              }
            );
            hardDeleteRecord(Token, { _id: decoded.profile._id });
            return successResponse(res, {
              message: "password change successfully",
            });
          });
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
  adminsignUp: async (req, res) => {
    try {
      req.body = decodeUris(req.body);
      const userdata = await findOneRecord(adminmodal, {
        email: req.body.email,
      });
      if (userdata !== null) {
        return badRequestResponse(res, {
          message: "user is already exist.",
        });
      } else {
        await bcrypt.hash(req.body.password, 8).then(async (pass) => {
          const isCreated = await adminmodal({
            email: req.body.email,
            password: pass,
          }).save();
        });
        successResponse(res, {
          message: "user create successfully",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  adminsignIn: async (req, res) => {
    try {
      req.body = decodeUris(req.body);
      const user = await findOneRecord(adminmodal, { email: req.body.email });
      console.log(user);
      if (!user) {
        notFoundResponse(res, { message: "User Not Found!" });
      } else {
        // const match = await bcrypt.compare(user.password, req.body.password);
        if (user.password !== req.body.password) {
          badRequestResponse(res, { message: "Password is incorrect!" });
        } else {
          const accessToken = await token(adminmodal, user);
          successResponse(res, {
            message: "Login successfully",
            token: accessToken.token,
            Role: "admin",
          });
        }
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
};
