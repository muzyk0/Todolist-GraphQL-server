import {
    Arg,
    Args,
    ArgsType,
    Ctx,
    Field,
    FieldResolver,
    Int,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from "type-graphql";
import { EntityManager, Transaction, TransactionManager } from "typeorm";
import { Task } from "../entity/Task";
import { Todolist } from "../entity/Todolist";
import { isAuth } from "../Middlewares/isAuth";
import { AppContext } from "../types/AppCntext";

@ArgsType()
export class AddTodolistInput {
    @Field()
    title: string;

    @Field({ nullable: true })
    description?: string;
}

@ArgsType()
export class UpdateTodolistInput {
    @Field(() => Int)
    id: number;

    @Field({ nullable: true })
    title?: string;

    @Field({ nullable: true })
    description?: string;
}

@Resolver(() => Todolist)
export class TodolistResolver {
    // @FieldResolver(() => [Task])
    // async taskList(@Root() todolist: Todolist) {
    //     return Task.find({ where: { todolistId: todolist.id } });
    // }

    @Query(() => [Todolist])
    @UseMiddleware(isAuth)
    async todolists(@Ctx() ctx: AppContext): Promise<Todolist[]> {
        const todolists = await Todolist.find({
            where: { userId: ctx.payload!.userId },
            relations: ["tasks"],
            order: {
                id: "ASC",
            },
        });

        // if (!todolists) {
        //     throw new Error("Todolists not found");
        // }
        return todolists;
    }

    @Mutation(() => Todolist)
    @UseMiddleware(isAuth)
    @Transaction()
    async addTodolist(
        @TransactionManager() m: EntityManager,
        @Ctx() ctx: AppContext,
        @Args() options: AddTodolistInput
    ): Promise<Todolist> {
        const todolist = m.create(Todolist, {
            ...options,
            userId: ctx.payload!.userId,
            // tasks: [1, 2].map((taskId) => m.create(Task, { id: taskId })),
        });

        return m.save(todolist);
    }

    @Mutation(() => Todolist)
    @UseMiddleware(isAuth)
    @Transaction()
    async updateTodolist(
        @TransactionManager() m: EntityManager,
        @Args() { id, ...options }: UpdateTodolistInput
    ): Promise<Todolist> {
        const todolist = await m.findOne(Todolist, id);

        if (!todolist) {
            throw new Error("Todolist not found");
        }

        await m.update(Todolist, todolist.id, options);

        return m.findOneOrFail(Todolist, todolist.id);
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    @Transaction()
    async removeTodolist(
        @TransactionManager() m: EntityManager,
        @Arg("id", () => Int) id: number
    ) {
        const todolist = await m.findOne(Todolist, id);

        if (!todolist) {
            throw new Error("Todolist has already been removed");
        }
        todolist.softRemove();
        return true;
    }
}
