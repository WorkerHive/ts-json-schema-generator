import { BaseType } from "./BaseType";

export class TupleType extends BaseType {
    public constructor(private types: readonly BaseType[]) {
        super();
    }

    public getId(): string {
        console.log(this.types.map((x) => x.getId()));
        return `[${this.types.map((item) => item.getId()).join(",")}]`;
    }

    public getTypes(): readonly BaseType[] {
        console.log(this.types);
        return this.types;
    }
}
