import express from "express";
import dotenv from "dotenv";
const app = express();
import appSetup from "./startup/init";
import eventConsumer from "./realtime/eventConsumer";
import io from 'socket.io-client'
import { PDFNet } from "@pdftron/pdfnet-node";
import routerSetup from "./startup/router";


dotenv.config();

const { APRYSE_LICENSE_KEY } = process.env
const SOCKET_SERVER = process.env.SOCKET_SERVER || 'http://localhost:5000'

const init = async () => {
  await appSetup(app);
  routerSetup(app);
  await PDFNet.initialize(APRYSE_LICENSE_KEY);
  const socket = io(SOCKET_SERVER)
  socket.on('connect', () => {
    console.log('Connected to server')
    eventConsumer(socket)
  })
};

init()
