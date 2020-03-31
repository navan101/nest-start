import {
    CreateDateColumn,
    UpdateDateColumn,
    Column
  } from 'typeorm';
  
  export class BaseEntity {

    @CreateDateColumn({ type: "datetime", nullable: false })
    CreatedAt: Date;
  
    @UpdateDateColumn({ type: "datetime", nullable: false })
    UpdatedAt: Date;
  
    @Column({ type: "datetime", nullable: true, default: null })
    DeletedAt: Date;
  }