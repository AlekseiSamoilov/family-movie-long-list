import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class Group extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    users: Types.ObjectId[];
}  