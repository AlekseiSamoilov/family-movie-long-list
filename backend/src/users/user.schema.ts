import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class User extends Document {
    @Prop({ require: true })
    name: string;

    @Prop({ require: true, unique: true })
    login: string;

    @Prop({ require: true })
    password: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Group ' }] })
    groups: Types.ObjectId[];

    @Prop({ default: 0 })
    moviesWatched: number;

    @Prop({ default: 0 })
    moviesAdded: number;
}

export const UserSchema = SchemaFactory.createForClass(User);