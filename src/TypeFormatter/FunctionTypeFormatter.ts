import { Definition } from "../Schema/Definition";
import { SubTypeFormatter } from "../SubTypeFormatter";
import { BaseType } from "../Type/BaseType";
import { UndefinedType } from "../Type/UndefinedType";
import { UnionType } from "../Type/UnionType";
import { TypeFormatter } from "../TypeFormatter";
import { getAllOfDefinitionReducer } from "../Utils/allOfDefinition";
import { derefType } from "../Utils/derefType";
import { preserveAnnotation } from "../Utils/preserveAnnotation";
import { removeUndefined } from "../Utils/removeUndefined";
import { StringMap } from "../Utils/StringMap";
import { uniqueArray } from "../Utils/uniqueArray";
import { FunctionObjectType, FunctionProperty } from "../Type/FunctionObjectType";

export class FunctionTypeFormatter implements SubTypeFormatter {
    public constructor(private childTypeFormatter: TypeFormatter) { }

    public supportsType(type: FunctionObjectType): boolean {
        return type instanceof FunctionObjectType;
    }

    public getDefinition(type: FunctionObjectType): Definition {
        const types = type.getBaseTypes();
        if (types.length === 0) {
            return this.getObjectDefinition(type);
        }

        console.log(types.reduce(getAllOfDefinitionReducer(this.childTypeFormatter), this.getObjectDefinition(type)));

        return this.getObjectDefinition(type);
        //types.reduce(getAllOfDefinitionReducer(this.childTypeFormatter), this.getObjectDefinition(type));
    }

    public getChildren(type: FunctionObjectType): BaseType[] {
        const properties = type.getProperties();

        const childrenOfBase = type
            .getBaseTypes()
            .reduce(
                (result: BaseType[], baseType) => [...result, ...this.childTypeFormatter.getChildren(baseType)],
                []
            );

        const childrenOfAdditionalProps: any = [];
        //  additionalProperties instanceof BaseType ? this.childTypeFormatter.getChildren(additionalProperties) : [];

        const childrenOfProps = properties.reduce((result: BaseType[], property) => {
            const propertyType = property.getType();
            if (propertyType === undefined) {
                return result;
            }

            return [...result, ...this.childTypeFormatter.getChildren(propertyType)];
        }, []);

        const children = [...childrenOfBase, ...childrenOfAdditionalProps, ...childrenOfProps];

        return uniqueArray(children);
    }

    private getObjectDefinition(type: FunctionObjectType): Definition {
        const objectProperties = type.getProperties();
        // const additionalProperties: BaseType | boolean = type.getAdditionalProperties();

        const preparedProperties = objectProperties.map((property) => this.prepareObjectProperty(property));

        const required = preparedProperties
            .filter((property) => property.isRequired())
            .map((property) => property.getName());

        const properties = preparedProperties.reduce((result: StringMap<Definition>, property) => {
            const propertyType = property.getType();

            if (propertyType !== undefined) {
                result[property.getName()] = this.childTypeFormatter.getDefinition(propertyType);
            }

            return result;
        }, {});

        return {
            //Make own schema for function spec
            type: "object",
            ...(Object.keys(properties).length > 0 ? { properties } : {}),
            ...(required.length > 0 ? { required } : {}),
        };
    }

    private prepareObjectProperty(property: FunctionProperty): FunctionProperty {
        const propertyType = property.getType();
        const propType = derefType(propertyType);

        if (propType instanceof UndefinedType) {
            return new FunctionProperty(property.getName(), propertyType, false);
        } else if (!(propType instanceof UnionType)) {
            return property;
        }

        const { newType: newPropType, numRemoved } = removeUndefined(propType);

        if (numRemoved == 0) {
            return property;
        }

        return new FunctionProperty(property.getName(), preserveAnnotation(propertyType!, newPropType), false);
    }
}
