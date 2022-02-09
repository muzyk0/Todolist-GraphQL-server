import { Field, Int, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { BaseEntityWithDates } from "./BaseEntityWithDates";
import { Todolist } from "./Todolist";

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

    @OneToMany(() => Todolist, (todolist) => todolist.user)
    todolists: Todolist[];
}
