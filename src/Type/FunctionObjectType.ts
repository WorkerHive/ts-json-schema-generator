import { BaseType } from "./BaseType";
import { strip } from "../Utils/String";

export class FunctionProperty {
    public constructor(private name: string, private type: BaseType | undefined, private required: boolean) {}

    public getName(): string {
        return strip(this.name);
    }
    public getType(): BaseType | undefined {
        return this.type;
    }
    public isRequired(): boolean {
        return this.required;
    }
}

export class FunctionObjectType extends BaseType {
    public constructor(
        private id: string,
        private baseTypes: readonly BaseType[],
        private properties: readonly FunctionProperty[]
    ) {
        super();
    }

    public getId(): string {
        return this.id;
    }

    public getBaseTypes(): readonly BaseType[] {
        return this.baseTypes;
    }
    public getProperties(): readonly FunctionProperty[] {
        return this.properties;
    }
}
