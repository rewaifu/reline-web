import { NodeType, ResizeFilterType, ReaderNodeMode } from "~/types/enums";
import type { StackNode } from "~/types/node";
import {FolderReaderNodeOptions, ResizeNodeOptions} from "~/types/options";

export function migrateNodes(nodes: StackNode[]): StackNode[] {
    return nodes.map((node) => {
        if (node.type === NodeType.RESIZE) {
            const options = node.options as ResizeNodeOptions;
            const filterValue = options.filter;

            if (!Object.values(ResizeFilterType).includes(filterValue)) {
                return {
                    ...node,
                    options: {
                        ...options,
                        filter: ResizeFilterType.CUBIC_MITCHELL,
                    },
                };
            }
        }
        if (node.type === NodeType.FOLDER_READER) {
            const options = node.options as FolderReaderNodeOptions;
            const modeValue = options.mode;

            if (!Object.values(ReaderNodeMode).includes(modeValue)) {
                return {
                    ...node,
                    options: {
                        ...options,
                        mode: ReaderNodeMode.RGB,
                    },
                };
            }
        }
        return node;
    });
}