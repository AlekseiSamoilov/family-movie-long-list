import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

@Schema()
export class Group extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    members: Types.ObjectId[];

    @Prop({ type: [{ movieId: { type: Types.ObjectId, ref: 'Movie' }, recommendedBy: { type: Types.ObjectId, ref: 'Users' } }] })
    sharedWatchList: { movieId: Types.ObjectId; recommendedBy: Types.ObjectId }[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);