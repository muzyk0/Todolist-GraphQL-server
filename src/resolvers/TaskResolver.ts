import { Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { EntityManager, Transaction, TransactionManager } from "typeorm";
import { Task } from "../entity/Task";
import { Todolist } from "../entity/Todolist";
import { isAuth } from "../Middlewares/isAuth";
import { AppContext } from "../types/AppCntext";

@Resolver(() => Todolist)
export class TaskResolver {
    @Mutation(() => Task)
    @UseMiddleware(isAuth)
    @Transaction()
    async addTask(@TransactionManager() m: EntityManager): Promise<Task> {
        const todolist = m.create(Task, {
            title: "Task",
            description: "Description",
            todolistId: 11,
        });

        return m.save(todolist);
    }
}
