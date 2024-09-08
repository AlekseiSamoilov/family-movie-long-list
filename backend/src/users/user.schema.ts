import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema()
export class User extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    login: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    passwordHint: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Movie' }] })
    watchList: Types.ObjectId[];

    @Prop({ type: [{ movieId: { type: Types.ObjectId, ref: 'Movie' }, rating: Number }] })
    watched: { movieId: Types.ObjectId; rating: number }[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Group' }] })
    groups: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);