import { useTypeORM } from "../databases/postgres/typeorm";
import { DocumentEntity } from "../databases/postgres/entity/document.entity";

export const updateStatus = async (
  uid: string,
  key: "pdf_status" | "json_status",
  status: string
) => {
  try {
    await useTypeORM(DocumentEntity).update(
      {
        uid,
      },
      {
        [key]: status,
      }
    );
  } catch (error) {
    console.error(error);
    return false;
  }
};
