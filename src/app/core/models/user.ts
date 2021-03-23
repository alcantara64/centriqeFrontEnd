import { IBaseInterFace } from "./baseInterface";

export interface IUser extends IBaseInterFace{
    id:string;
    firstName:string;
    lastName:string;
    userId: string;
    email:string;
    title: string;
    roles: Array<any>;
    resetPasswordNextLogon?:boolean;
}