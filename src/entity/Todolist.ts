import { Field, Int, ObjectType } from "type-graphql";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    DeleteDateColumn,
} from "typeorm";
import { BaseEntityWithDates } from "./BaseEntityWithDates";
import { Task } from "./Task";
import { User } from "./User";

@ObjectType()
@Entity("todolists")
export class Todolist extends BaseEntityWithDates {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @Column("text")
    title: string;

    @Field(() => String, { nullable: true })
    @Column("text")
    description?: string;

    @Field()
    @ManyToOne(() => User, (user) => user.todolists)
    user: User;

    @Field()
    @Column()
    userId: number;

    @Field(() => [Task])
    @OneToMany(() => Task, (task) => task.todolist)
    @JoinColumn()
    tasks: Task[];
}
