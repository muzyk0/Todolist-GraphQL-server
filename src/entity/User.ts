import { Field, Int, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { BaseEntityWithDates } from "./BaseEntityWithDates";

@ObjectType()
@Entity("users")
export class User extends BaseEntityWithDates {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @Column("text", { unique: true })
    email: string;

    @Column("text")
    password: string;

    @Field(() => String)
    @Column("text")
    name: string;

    @Column("int", { default: 0 })
    tokenVersion: number;
}
