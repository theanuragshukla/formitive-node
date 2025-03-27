import { Express } from "express";
import typeORMConnect from "../databases/postgres/typeorm";

const appSetup = async (app: Express) => {
  try {
    await Promise.all([typeORMConnect()]);

    console.log("Databases connected successfully!");
    const PORT = Number(process.env.PORT) || 8000;

    return app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error: unknown) {
    console.log("Unable to start the app!");
    console.error(error);
  }
};

export default appSetup;
