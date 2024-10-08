import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.schema";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { GroupModule } from "src/groups/group.module";

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        GroupModule
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UserModule { }
