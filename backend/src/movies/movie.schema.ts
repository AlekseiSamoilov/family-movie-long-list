import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

@Schema()
export class Movie extends Document {
    @Prop({ required: true })
    name: string;

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

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Group' }] })
    group: Types.ObjectId[];

    @Prop()
    stars: number;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);