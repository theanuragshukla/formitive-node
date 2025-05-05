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

export const getDocStatus = async (uid: string): Promise<{
  pdf_status: string;
  json_status: string;
}> => {
  try {
    const doc = await useTypeORM(DocumentEntity).findOneBy({ uid });
    if (!doc) return {
      pdf_status: "FAILURE",
      json_status: "FAILURE",
    }
    return {
      pdf_status: doc.pdf_status,
      json_status: doc.json_status,
    };
  } catch (error) {
    console.error(error);
    return {
      pdf_status: "FAILURE",
      json_status: "FAILURE",
      };
  }
}
