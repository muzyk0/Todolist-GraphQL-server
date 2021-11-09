import { Field, Int, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { BaseEntityWithDates } from "./BaseEntityWithDates";
import { Todolist } from "./Todolist";

@ObjectType()
@Entity("tasks")
export class Task extends BaseEntityWithDates {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @Column("text")
    title: string;

    @Field()
    @Column("text")
    description: string;

    @ManyToOne(() => Todolist, (todolist) => todolist.tasks)
    todolist: Todolist;
    @Column()
    todolistId: Todolist["id"];
}
