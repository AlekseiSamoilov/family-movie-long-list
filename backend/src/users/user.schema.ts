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

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Group' }] })
    groups: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Movie' }] })
    watchedMovies: Types.ObjectId[];

    @Prop({ default: 0 })
    moviesWatched: number;

    @Prop({ default: 0 })
    moviesAdded: number;
}

export const UserSchema = SchemaFactory.createForClass(User);