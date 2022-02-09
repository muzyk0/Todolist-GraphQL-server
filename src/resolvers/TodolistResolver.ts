import {
    Arg,
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
    @Query(() => [Todolist])
    @UseMiddleware(isAuth)
    async todolists(@Ctx() ctx: AppContext): Promise<Todolist[]> {
        const todoLists = await Todolist.find({
            where: { userId: ctx.payload!.userId },
            relations: ["tasks"],
            order: {
                id: "ASC",
            },
        });
        return todoLists;
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

    @Mutation(() => Todolist)
    @UseMiddleware(isAuth)
    @Transaction()
    async removeTodolist(
        @TransactionManager() m: EntityManager,
        @Arg("id", () => Int) id: number
    ): Promise<Todolist> {
        const todolist = await m.findOne(Todolist, id);

        if (!todolist) {
            throw new Error("Todolist has already been removed");
        }
        return await todolist.softRemove();
    }
}
