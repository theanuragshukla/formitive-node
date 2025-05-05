import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("docs")
export class DocumentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  uid: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  original_name: string;

  @Column({ type: "varchar", length: 12, nullable: false, default: "ENQUEUED" })
  pdf_status: string;

  @Column({ type: "varchar", length: 12, nullable: false, default: "ENQUEUED" })
  json_status: string;

  @Column({ type: "json", nullable: true, default: [] })
  updates: any[];

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;
}
