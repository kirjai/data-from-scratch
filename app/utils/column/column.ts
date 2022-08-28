/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from "io-ts";
import type { ADTType } from "@morphic-ts/adt";
import { makeADT, ofType } from "@morphic-ts/adt";
import * as O from "fp-ts/Option";
import * as ROA from "fp-ts/lib/ReadonlyArray";
import { pipe } from "fp-ts/lib/function";

export const ColumnType = t.union([
  t.literal("name"),
  t.literal("age"),
  t.literal("dob"),
  t.literal("email"),
  t.literal("address"),
  t.literal("correlated"),
  t.literal("gamma"),
  t.literal("uniform"),
  t.literal("normal"),
  t.literal("categorical"),
]);

export type ColumnType = t.TypeOf<typeof ColumnType>;

export type EmptyColumn = {
  type: "EmptyColumn";
  name: string;
};

export type GeneratedColumn = {
  type: "GeneratedColumn";
  columnType: ColumnType;
  name: string;
  values: (string | number)[];
};

export type UnknownColumn = {
  type: "UnknownColumn";
  name: string;
  values: string[];
};

export const Column = makeADT("type")({
  EmptyColumn: ofType<EmptyColumn>(),
  GeneratedColumn: ofType<GeneratedColumn>(),
  UnknownColumn: ofType<UnknownColumn>(),
});

export type Column = ADTType<typeof Column>;

const columnsWithValues = new Set([
  "GeneratedColumn",
  "UnknownColumn",
] as const);
// const ColumnsWithValues = Column.select([...columnsWithValues]);

const isColumnWithValues = Column.isAnyOf([...columnsWithValues]);

export const fromTable = (rows: string[][]): UnknownColumn[] => {
  const names = rows[0];
  return rows.slice(1).reduce((columns, row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const columnValues = columns[columnIndex]?.values ?? [];
      columnValues[rowIndex] = cell;

      if (!columns[columnIndex]) {
        columns[columnIndex] = {
          type: "UnknownColumn",
          name: names[columnIndex] ?? "",
          values: columnValues,
        };
      } else {
        columns[columnIndex].values = columnValues;
      }
    });

    return columns;
  }, [] as UnknownColumn[]);
};

const longestColumn = (columns: Column[]) => {
  const withValues = columns.filter(isColumnWithValues);

  return withValues.reduce((longest, column) => {
    if (O.isNone(longest)) return O.some(column);

    if (longest.value.values.length < column.values.length)
      return O.some(column);

    return longest;
  }, ROA.head(withValues));
};

export const toRows = (columns: Column[]) => {
  const longest = longestColumn(columns);

  if (O.isNone(longest)) return [columns.map(() => O.none)];

  return longest.value.values.map((_, index) => {
    return columns.map((column) => {
      return Column.isAnyOf([...columnsWithValues])(column)
        ? O.fromNullable(column.values[index])
        : O.none;
    });
  });
};

export const toCSV = (columns: Column[]) => {
  const longest = longestColumn(columns);

  if (O.isNone(longest)) return [];

  const withValues = columns.filter(isColumnWithValues);

  const dataColumns = longest.value.values.map((_, index) => {
    return withValues.map((column) => {
      return pipe(
        O.fromNullable(column.values[index]),
        O.map(String),
        O.getOrElse(() => "")
      );
    });
  });

  dataColumns.unshift(withValues.map((col) => col.name));
  return dataColumns;
};

export const columnNameLens = Column.lensFromProp("name");
