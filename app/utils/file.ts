import type * as t from "io-ts";
import { fromRefinement } from "io-ts-types";

export interface FileC extends t.Type<File, File, unknown> {}

const isFile = (u: unknown): u is File => u instanceof File;

export const file: FileC = fromRefinement("File", isFile);
