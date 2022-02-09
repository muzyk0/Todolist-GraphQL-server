import { TaskResolver } from "./TaskResolver";
import { TodolistResolver } from "./TodolistResolver";
import { UserResolver } from "./UserResolver";

export default [UserResolver, TodolistResolver, TaskResolver] as [
    Function,
    ...Function[]
];
