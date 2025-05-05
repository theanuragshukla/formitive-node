import cors from "cors";
import { Express } from "express";

const securitySetup = (app: Express, express: any) =>
  app
    .use(
      express.json({
        limit: "50mb",
      })
    )
    .use(express.urlencoded({ extended: true }))
    .use(
      cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
      })
    );

export default securitySetup;
