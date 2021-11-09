import { Min } from "class-validator";
import {
    Args,
    ArgsType,
    Ctx,
    Field,
    Int,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import { EntityManager, Transaction, TransactionManager } from "typeorm";
import { Task } from "../entity/Task";
import { Todolist } from "../entity/Todolist";
import { isAuth } from "../Middlewares/isAuth";
import { AppContext } from "../types/AppCntext";

@ArgsType()
export class AddTaskInput {
    @Field(() => Int)
    todolistId: number;

    @Min(5, { message: "Length must be longer than 5 characters" })
    @Field()
    title: string;

    @Field()
    description: string;
}

@ArgsType()
export class UpdateTaskInput {
    @Field(() => Int)
    id: number;

    @Field(() => Int, { nullable: true })
    todolistId?: number;

    @Min(5, { message: "Length must be longer than 5 characters" })
    @Field({ nullable: true })
    title?: string;

    @Field({ nullable: true })
    description?: string;
}

@Resolver(() => Todolist)
export class TaskResolver {
    @Mutation(() => Task)
    @UseMiddleware(isAuth)
    @Transaction()
    async addTask(
        @TransactionManager() m: EntityManager,
        @Args() { title, description, todolistId }: AddTaskInput
    ): Promise<Task> {
        const todolist = m.create(Task, {
            title,
            description,
            todolistId,
        });

        return m.save(todolist);
    }

    @Mutation(() => Task)
    @UseMiddleware(isAuth)
    @Transaction()
    async updateTask(
        @TransactionManager() m: EntityManager,
        @Args() { id, ...options }: UpdateTaskInput
    ): Promise<Task> {
        const task = await m.findOne(Task, id);

        if (!task) {
            throw new Error("Task not found");
        }

        await m.update(Task, task?.id, options);

        return m.findOneOrFail(Task, task.id);
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    @Transaction()
    async removeTask(
        @TransactionManager() m: EntityManager,
        @Args() { id, ...options }: UpdateTaskInput
    ): Promise<boolean> {
        const task = await m.findOne(Task, id);

        if (!task) {
            throw new Error("Task not found");
        }

        await m.softDelete(Task, task.id);

        return true;
    }
}
