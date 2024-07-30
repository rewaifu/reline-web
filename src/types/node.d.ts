export interface StackNode {
    name: string
    options: GenericNodeOptions
}

export interface GenericNodeOptions {
    [key: string]: string | number | boolean | undefined;
}