import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
} from "typeorm";

@ObjectType()
export class BaseEntityWithDates extends BaseEntity {
    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field()
    @Column({ default: false })
    archived: boolean;
}
