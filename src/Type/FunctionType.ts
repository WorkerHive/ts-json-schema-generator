import { BaseType } from "./BaseType";

export class FunctionType extends BaseType {
    public constructor() {
        super();
    }

    public getId(): string {
        return "function";
    }
}
