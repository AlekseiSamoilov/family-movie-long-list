import { MongooseModule } from "@nestjs/mongoose";
import { Group, GroupSchema } from "./group.schema";
import { GroupController } from "./group.controller";
import { GroupService } from "./group.service";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }])
    ],
    controllers: [GroupController],
    providers: [GroupService],
    exports: [GroupService]
})

export class GroupModule { }