import { NodeType, FilterType, ReaderNodeMode, TilerType } from "~/types/enums";
import type { StackNode } from "~/types/node";
import {FolderReaderNodeOptions, ResizeNodeOptions, UpscaleNodeOptions} from "~/types/options";

export function migrateNodes(nodes: StackNode[]): StackNode[] {
    return nodes.map((node) => {
        if (node.type === NodeType.RESIZE) {
            const options = node.options as ResizeNodeOptions;
            const filterValue = options.filter;

            if (!Object.values(FilterType).includes(filterValue)) {
                return {
                    ...node,
                    options: {
                        ...options,
                        filter: FilterType.SHAMMING4,
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
        if (node.type === NodeType.UPSCALE) {
            const options = node.options as UpscaleNodeOptions;
            const tilerValue = options.tiler;
            if (!Object.values(TilerType).includes(tilerValue)) {
                return {
                    ...node,
                    options: {
                        ...options,
                        tiler: TilerType.EXACT,
                        exact_tiler_size: 512
                    },
                };
            }
        }
        return node;
    });
}