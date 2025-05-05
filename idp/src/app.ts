import express from "express";
import dotenv from "dotenv";
const app = express();
import appSetup from "./startup/init";
import {pdfConsumer, jsonConsumer} from "./realtime/eventConsumer";
import { PDFNet } from "@pdftron/pdfnet-node";
import routerSetup from "./startup/router";
import securitySetup from "./startup/security";
import SocketIO from './realtime/setup'


dotenv.config();

const { APRYSE_LICENSE_KEY } = process.env

const init = async () => {
  securitySetup(app, express);
  routerSetup(app);
  const server = await appSetup(app);
  const io = SocketIO.getInstance(server)
  await PDFNet.initialize(APRYSE_LICENSE_KEY);
  jsonConsumer(io.io)
  pdfConsumer(io.io)
};

init()
