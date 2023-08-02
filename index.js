require("dotenv").config();
require("./config/db");
const express = require("express");
const cors = require("cors");
const swaggerJson = require("./swagger/swagger.json");
const swaggerUi = require("swagger-ui-express");
const Web3 = require("web3");
const env = require("./env");
const { success, failed } = require("./helper");
const Usermodal = require("./models/user");

const infraUrl = env.globalAccess.rpcUrl;

const ContractAbi = env.contract.ablcAbi.abi;

const ContractAddress = env.globalAccess.ablcContract;

const ContractAbiForBUSD = env.contract.busdAbi.abi;

const ContractAddressForBUSD = env.globalAccess.busdContract;

const PrivateKey = env.privateKey;

const web3 = new Web3(infraUrl);
const app = express();
app.use(cors());
const routes = require("./routes/index");
const transactions = require("./models/transactions");

app.use(
  express.json({
    limit: "1024mb",
  })
);
app.use(
  express.urlencoded({
    limit: "1024mb",
    extended: true,
  })
);
const init1 = async (to_address, token_amount) => {
  const myContract = new web3.eth.Contract(
    JSON.parse(ContractAbi),

    ContractAddress
  );
  const tx = myContract.methods.transfer(
    to_address,
    Math.floor(Number(token_amount)) + "00000000"
  );

  try {
    const gas = 500000;

    const data = tx.encodeABI();

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: myContract.options.address,

        data,

        gas: gas,

        value: "0x0",
      },

      PrivateKey
    );

    console.log("Started", signedTx);

    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    )

    console.log(`Transaction Hash :  ${receipt.transactionHash}`);
    if (receipt.transactionHash !== "") {
      // await transactions.updateOne(
      //   {
      //     _id: id,
      //   },
      //   {
      //     SendtokenByadminHash: JSON.stringify(receipt.transactionHash),
      //     SendtokenByadmin: true,
      //   }
      // );
    }
    return [true, signedTx];
  } catch (error) {
    // console.log(error);
    return [false, error];
  }
};
const transInfo = async (Hash) => {
  try {
    const hash = await web3.eth.getTransactionReceipt(Hash);
    return [true, hash];
  } catch (error) {
    return [false, error];
  }
};
app.use("/api", routes);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerJson));

app.post("/transHash", async (req, res) => {
  let transHash = req.body.transHash;

  let result = [];

  web3.eth
    .getTransactionReceipt(transHash)
    .then((receipt) => {
      if (receipt) {
        if (receipt.logs.length) {
          let log = receipt.logs[0];

          result = [
            true,
            {
              from: web3.eth.abi.decodeParameter("address", log.topics[1]),

              to: web3.eth.abi.decodeParameter("address", log.topics[2]),

              amount: web3.eth.abi.decodeParameter("uint256", log.data),

              contractAddress: log.address,
            },
          ];
        } else {
          result = [false];
        }
      } else {
        result = [false];
      }

      res.send(result);
    })
    .catch(() => {
      result = [false];

      res.send(result);
    });
});
app.get("/", async (req, res) => {
  console.log("working", env.contract.rpcUrl);
  res.send({
    status: "working",
  });
});
app.post("/payment", async (req, res) => {
  const to_address = req.body.to_address;
  var token_amount = req.body.token_amount;
  var id = req.body.userid;

  if (to_address == "" || to_address == undefined) {
    res.send(failed("Enter a Valid Address"));

    return;
  }

  if (token_amount == "" || token_amount == undefined || isNaN(token_amount)) {
    res.send(failed("Enter a Valid Amount"));

    return;
  }
  token_amount =
    Number.isInteger(token_amount) || isFloat(token_amount)
      ? token_amount.toString()
      : token_amount;

  const res1 = await init1(
    req.body.to_address, id,
    parseInt(token_amount)
  );
  var results = res1[0];
  if (results) {
    res.status(200).send({ Message: "Transaction success", data: res1 });
  } else {
    res.status(500).send({ Message: "Transaction failed", data: res1 });
  }
});
app.post("/paymentall", async (req, res) => {
  const { data } = req.body;
  console.log(data);
  if (data.length !== 0) {
    for (let i = 0; i < data.length;) {
      const to_address = data[i]["Account"];
      var token_amount = data[i]["purchasedAmount"];
      var id = data[i]._id;
      await init1(to_address, id, parseInt(token_amount)).then((e) => {
        console.log(e);
        i++;
      });
    }
    res.status(200).send({ Message: "Transaction success", data: results });
  }
});
function isFloat(n) {
  return Number(n) == n && n % 1 !== 0;
}
const LOCALPORT = process.env.PORT || 8080;

app.listen(LOCALPORT, () => {
  console.log(`http://localhost:${LOCALPORT} is listening...`);
});
