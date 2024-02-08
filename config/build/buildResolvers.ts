import { Configuration } from "webpack";
import { BuildOPtions } from "./types/types";


export function buildResolvers(options: BuildOPtions): Configuration['resolve'] {
    
    return {
        extensions: ['.tsx', '.ts', '.js'],
    }
}