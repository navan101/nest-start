import { Module } from '@nestjs/common';
// import { Connection } from 'typeorm';
// import { DatabaseModule } from './database/database.module';


@Module({
  imports: [
    // DatabaseModule,
  ],
})
export class AppModule {
  // constructor(private readonly connection: Connection) {}
}
