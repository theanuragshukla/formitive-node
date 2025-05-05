import { DataSource, EntityTarget, ObjectLiteral, Repository } from "typeorm";

let typeORMDB: DataSource;

export default async function typeORMConnect(): Promise<void> {
  const dataSource = new DataSource({
    type: "postgres",
    url: process.env.PG_URI,
    entities: [
      `${__dirname}/entity/*.entity.js`,
      `${__dirname}/entity/*.entity.ts`,
    ],
    synchronize: true,
  });

  typeORMDB = await dataSource.initialize();
}

export const getDataSource = (): DataSource => typeORMDB

export function useTypeORM(
  entity: EntityTarget<ObjectLiteral>
): Repository<ObjectLiteral> {
  if (!typeORMDB) {
    throw new Error("TypeORM has not been initialized!");
  }

  return typeORMDB.getRepository(entity);
}
