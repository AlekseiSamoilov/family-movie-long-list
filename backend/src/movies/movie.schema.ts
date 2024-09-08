import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

@Schema()
export class Movie extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    genre: string;

    @Prop({ required: true })
    year: number;

    @Prop()
    director: string;

    @Prop({ required: true })
    addedAt: Date;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    addedBy: Types.ObjectId[];

    @Prop({ type: [{ user: { type: Types.ObjectId, ref: 'User' }, rating: Number }] })
    ratings: { user: Types.ObjectId; ratings: number }[]
}

export const MovieSchema = SchemaFactory.createForClass(Movie);