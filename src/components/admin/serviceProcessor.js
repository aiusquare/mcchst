import axios from "axios";
import "firebase/compat/storage";
import { firebase } from "../services/config";
import "firebase/compat/database";
import request, { agent } from "superagent";
import { saveTransaction } from "./transactionsSummaryComponent";
import { stat } from "fs";
import { useState } from "react";
import { useEffect } from "react";

const db = firebase.database();

const apiUrl = "https://api.foudhan.com";

export default async function buyData(reqData) {
  let status = "ok";

  const req = {
    userId: reqData.userId,
    url: "https://directortechs.com/api/data/",
    regBody: {
      network: reqData.networkId,
      mobile_number: reqData.phone,
      plan: reqData.plan,
      Ported_number: false,
    },
    amount: reqData.amount,
    service: "data",
    planName: reqData.planName,
    agent: reqData.userAgent,
  };

  await request
    .post("https://api.foudhan.com/data.php")
    .type("application/json")
    .send(req)
    .then((response) => {
      if (response.data) {
        console.log("Success:", response.data.message);
        status = response.data;
      } else {
        console.log("Response data is undefined or null");
        console.log("RESPONCE", response.body.message);

        status = response.body;
      }
    })
    .catch((err) => {
      // console.log("Error message:", err.response); // or err.response.body

      status = err.response;

      if (err.response && err.response.status === 400) {
        // Handle the error response with status code 400
        const errorResponseData = err.response.body;

        status = errorResponseData.message;
      } else {
        // Handle other types of errors (e.g., network errors)
        // console.error("Network error:", err);
        status = err.text;
      }
    });

  return status;
}

export async function buyAirtime(reqData) {
  const req = {
    userId: reqData.userId,
    url: "https://directortechs.com/api/topup/",
    regBody: {
      network: reqData.networkId,
      amount: reqData.amount,
      mobile_number: reqData.phone,
      Ported_number: false,
      airtime_type: reqData.plan,
    },
    amount: reqData.amount,
    service: "airtime",
    agent: reqData.userAgent,
  };
}

export async function buyDataCard(reqData) {
  let status = "ok";

  const req = {
    userId: reqData.userId,
    url: "https://legitdataway.com/api/data_card",
    regBody: {
      network: reqData.networkId,
      plan_type: reqData.plan,
      quantity: reqData.quantity,
      card_name: reqData.cardName,
    },
    amount: reqData.amount,
    service: "datacard",
    agent: reqData.userAgent,
  };

  await request
    .post("https://perfect-gray-fish.cyclic.app/foudhanapi")
    .type("application/json")
    .send(req)
    .then((response) => {
      console.log("Success:", response);

      status = response;
    })
    .catch((err) => {
      // console.log("Error message:", err.response); // or err.response.body
      // console.log("ERROR", err);
      status = err.response.text;
    });

  return status;
}

export async function bulkSms(reqData) {
  let status = "ok";

  const userid = reqData.userId;
  const userAgent = reqData.userAgent;
  const message = reqData.message;
  const recipient = reqData.recipient;
  const sender = reqData.sender;
  const numCount = reqData.numCount;

  await request
    .post(apiUrl + "/bulksms.php")
    .type("application/x-www-form-urlencoded")
    .send(
      `user_id=${userid}&sender=${sender}&message=${message}&numbers=${recipient}&numCount=${numCount}&agent_id=${userAgent}`
    )
    .then((response) => {
      const resObj = JSON.parse(response.text);

      const date = new Date();
      const formattedDate = date.toLocaleDateString("en-GB");

      const transaction = {
        service: "bulksms",
        details: "You have succesfully send BULK messages",
        refNo: resObj.request_id,
        date: formattedDate,
      };

      saveTransaction(transaction, userid);
    })
    .catch((err) => {
      // console.log("Error message:", err); // or err.response.body

      status = err.response.text + "somthing went wrong";
    });

  return status;
}

export async function electricity(reqData) {
  let status = "ok";

  const req = {
    userId: reqData.userId,
    url: "https://legitdataway.com/api/bill",
    regBody: {
      disco: reqData.disco,
      meter_number: reqData.meterNumber,
      meter_type: reqData.meterType,
      amount: reqData.amount,
      "request-id": reqData.orderId,
      bypass: false,
    },
    amount: reqData.amount,
    service: "electricity",
    agent: reqData.userAgent,
  };

  await request
    .post("https://api.foudhan.com/electricity.php")
    .type("application/json")
    .send(req)
    .then((response) => {
      if (response.data) {
        console.log("Success:", response.data.message);
        status = response.data;
      } else {
        console.log("Response data is undefined or null");
        console.log("RESPONCE", response.body.message);

        status = response.body;
      }
    })
    .catch((err) => {
      console.log("Error message:", err.response); // or err.response.body

      status = err.response;

      if (err.response && err.response.status === 400) {
        // Handle the error response with status code 400
        const errorResponseData = err.response.body;

        console.log("ERROR", errorResponseData);
        status = errorResponseData.message;
      } else {
        // Handle other types of errors (e.g., network errors)
        console.error("Network error:", err);
        status = err.text;
      }
    });

  return status;
}

export async function utility(reqData) {
  const userid = reqData.userId;
  const userAgent = reqData.userAgent;
  let status = "ok";

  const disco = reqData.disco;
  const meterNumber = reqData.meterNumber;
  const meterType = reqData.meterType;
  const amount = reqData.amount;
  const orderId = reqData.orderId;

  console.log("REG:", reqData);

  const req = {
    userId: userid,
    url: "https://legitdataway.com/api/bill",
    regBody: {
      disco: disco,
      meter_number: meterNumber,
      meter_type: meterType,
      amount: amount,
      "request-id": orderId,
      bypass: false,
    },
    amount: amount,
    service: "electricity",
    agent: userAgent,
  };

  console.log(req);

  await request
    .post("https://perfect-gray-fish.cyclic.app/foudhanapi")
    .type("application/json")
    .send(req)
    .then((response) => {
      console.log("Success:", response.body);
      console.log(response);
    })
    .catch((err) => {
      console.log("Error message:", err.response); // or err.response.body
      console.log("ERROR", err);
      status = err.response.text;
    });

  return status;
}

export async function posOrder(reqData) {
  let status = "ok";

  db.ref("/Admin/orders")
    .push(reqData)
    .then((e) => {
      console.log("Success:", e);
      console.log(e);
    })
    .catch((err) => {
      console.log("Error message:", err.response);
      console.log("ERROR", err);
      status = err.response.text;
    });

  return status;
}
