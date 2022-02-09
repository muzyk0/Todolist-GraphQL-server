import { MigrationInterface, QueryRunner } from "typeorm";

export class init1643745657316 implements MigrationInterface {
    name = "init1643745657316";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "users" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "email" text NOT NULL, "password" text NOT NULL, "name" text NOT NULL, "tokenVersion" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "todolists" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "title" text NOT NULL, "description" text, "userId" integer NOT NULL, CONSTRAINT "PK_cc719ed42358fd0fd02d91e0a87" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "tasks" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "title" text NOT NULL, "description" text, "todolistId" integer NOT NULL, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "todolists" ADD CONSTRAINT "FK_20f7cd6cfa3fb795585b20dc36e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "tasks" ADD CONSTRAINT "FK_db4fd29d7cec9923781d088fcba" FOREIGN KEY ("todolistId") REFERENCES "todolists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "tasks" DROP CONSTRAINT "FK_db4fd29d7cec9923781d088fcba"`
        );
        await queryRunner.query(
            `ALTER TABLE "todolists" DROP CONSTRAINT "FK_20f7cd6cfa3fb795585b20dc36e"`
        );
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TABLE "todolists"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
