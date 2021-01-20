import * as ts from "typescript";
import { Context, NodeParser } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { ArrayType } from "../Type/ArrayType";
import { BaseType } from "../Type/BaseType";
import { FunctionObjectType, FunctionProperty } from "../Type/FunctionObjectType";
import { OptionalType } from "../Type/OptionalType";
import { ReferenceType } from "../Type/ReferenceType";
import { RestType } from "../Type/RestType";

export class FuncTypeNodeParser implements SubNodeParser {
    public constructor(private childNodeParser: NodeParser) {}

    supportsNode(node: ts.Node): boolean {
        console.log(node.kind);
        return (
            node.kind === ts.SyntaxKind.FunctionType ||
            node.kind === ts.SyntaxKind.FunctionDeclaration ||
            node.kind === ts.SyntaxKind.ArrowFunction ||
            node.kind === ts.SyntaxKind.MethodDeclaration
        );
    }
    createType(node: ts.FunctionDeclaration, context: Context, reference?: ReferenceType): BaseType | undefined {
        const types = node.parameters.filter((a) => a.type);

        const base: BaseType[] = types.map((item) => {
            const type = this.childNodeParser.createType(item.type!, context);
            const elem: BaseType = item.dotDotDotToken
                ? new RestType(new ArrayType(type as BaseType))
                : item.questionToken
                ? new OptionalType(type as BaseType)
                : (type as BaseType);
            return elem;
        });
        const prop: FunctionProperty[] = types.map((item) => {
            const type = this.childNodeParser.createType(item.type!, context);
            const elem: BaseType = item.dotDotDotToken
                ? new RestType(new ArrayType(type as BaseType))
                : item.questionToken
                ? new OptionalType(type as BaseType)
                : (type as BaseType);
            return new FunctionProperty(item.name.getText(), elem, item.questionToken ? false : true);
        });
        console.log(types, prop);
        return new FunctionObjectType(`funcs`, base, prop);
    }
}
