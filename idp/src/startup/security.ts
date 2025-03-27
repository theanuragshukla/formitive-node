import { Express } from "express";

const securitySetup = (app: Express, express: any) =>
  app
    .use(express.json())
    .use(express.urlencoded({ extended: true }))

export default securitySetup;
