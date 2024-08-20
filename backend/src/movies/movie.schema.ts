import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class Movie extends Document {
    @Prop({ require: true })
    name: string;

    @Prop({ require: true })
    genre: string;

    @Prop({ require: true })
    year: number;

    @Prop()
    director: string;

    @Prop({ require: true })
    addedAt: Date;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    addedBy: Types.ObjectId[];

    @Prop()
    stars: number;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);