/* eslint-disable @typescript-eslint/no-redeclare */
import type { ColumnType } from "./column";
import { Column } from "./column";
import type { ADTType } from "@morphic-ts/adt";
import { makeADT, ofType } from "@morphic-ts/adt";

export type EmptyColumnHeader = {
  type: "EmptyColumnHeader";
  name: string;
};

export type GeneratedColumnHeader = {
  type: "GeneratedColumnHeader";
  columnType: ColumnType;
  name: string;
};

export type UnknownColumnHeader = {
  type: "UnknownColumnHeader";
  name: string;
};

export const Header = makeADT("type")({
  EmptyColumnHeader: ofType<EmptyColumnHeader>(),
  GeneratedColumnHeader: ofType<GeneratedColumnHeader>(),
  UnknownColumnHeader: ofType<UnknownColumnHeader>(),
});
export type Header = ADTType<typeof Header>;

export const fromColumns = (columns: Column[]): Header[] => {
  return columns.map((column) =>
    Column.matchStrict<Header>({
      EmptyColumn: (column): EmptyColumnHeader => ({
        type: "EmptyColumnHeader",
        name: column.name,
      }),
      GeneratedColumn: (column): GeneratedColumnHeader => ({
        type: "GeneratedColumnHeader",
        name: column.name,
        columnType: column.columnType,
      }),
      UnknownColumn: (column): UnknownColumnHeader => ({
        type: "UnknownColumnHeader",
        name: column.name,
      }),
    })(column)
  );
};
