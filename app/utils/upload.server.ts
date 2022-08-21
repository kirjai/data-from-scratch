import { parse as csvParse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

export const parse = (file: string) => {
  return csvParse(file);
};

export const encodeCSV = (contents: [][]) => {
  return stringify(contents);
};
