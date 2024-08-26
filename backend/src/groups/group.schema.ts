import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

@Schema()
export class Group extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    users: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Movie' }] })
    movies: Types.ObjectId[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);