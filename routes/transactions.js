const express = require("express");
const router = express.Router();
const transactionsController = require("../controllers/transactions");

router.post("/toadmin", (req, res) => {
  return transactionsController.transactions.transactionsDone(req, res);
});
router.post("/chengeprice", (req, res) => {
  return transactionsController.transactions.priceBNB(req, res);
});
router.post("/chengeprice1", (req, res) => {
  return transactionsController.transactions.priceUSDT(req, res);
});
router.get("/getall", (req, res) => {
  return transactionsController.transactions.Alltransactions(req, res);
});
router.get("/user", (req, res) => {
  return transactionsController.transactions.usertransactions(req, res);
});
router.get("/getallPrice", (req, res) => {
  return transactionsController.transactions.getallPrice(req, res);
});

module.exports = router;
