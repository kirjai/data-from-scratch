import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Lens } from "monocle-ts";
import * as ROA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import * as t from "io-ts";
import { pipe } from "fp-ts/lib/function";

export const ColumnTypeCodec = t.union([
  t.literal("name"),
  t.literal("age"),
  t.literal("dob"),
  t.literal("email"),
  t.literal("address"),
  t.literal("correlated"),
  t.literal("gamma"),
  t.literal("uniform"),
  t.literal("normal"),
]);

export type ColumnType = t.TypeOf<typeof ColumnTypeCodec>;

export const numericalColumnTypes: Set<ColumnType> = new Set([
  "age",
  "correlated",
]);

export type ColumnValue = t.TypeOf<typeof ColumnValueCodec>;

export const ColumnValueCodec = t.union([t.string, t.number]);

export type EmptyColumn = Omit<GeneratedColumn, "type" | "values">;

export const GeneratedColumnCodec = t.type({
  type: ColumnTypeCodec,
  name: t.string,
  values: t.array(ColumnValueCodec),
});

export type GeneratedColumn = t.TypeOf<typeof GeneratedColumnCodec>;

type Column = EmptyColumn | GeneratedColumn;

export const isGeneratedColumn = (column: Column): column is GeneratedColumn =>
  !!(column as GeneratedColumn).type;

const ColumnContext = createContext<{
  headers: readonly Omit<Column, "type">[];
  rows: O.Option<ColumnValue>[][];
  setColumnName: (index: number, name: Column["name"]) => void;
  columns: readonly Column[];
  columnsForType: (type: ColumnType) => GeneratedColumn[];
  addGeneratedColumn: (index: number, column: GeneratedColumn) => void;
  addNewColumn: () => void;
  deleteColumn: (index: number) => void;
  generatedColumns: readonly GeneratedColumn[];
  csv: (string | number)[][];
}>(null!);

export function useColumns() {
  return useContext(ColumnContext);
}

const columnNameLens = Lens.fromProp<Column>()("name");

function updateColumn<T>(updateFn: (t: T) => T) {
  return (index: number) => (values: readonly T[]) => {
    return pipe(
      O.fromNullable(values[index]),
      O.map(updateFn),
      O.chain((value) => ROA.updateAt(index, value)(values)),
      O.getOrElse(() => values)
    );
  };
}

export function ColumnProvider(props: PropsWithChildren<{}>) {
  const [columns, setColumns] = useState<readonly Column[]>(() => [
    {
      name: "Header",
    },
  ]);
  const generatedColumns = useMemo(
    () => columns.filter(isGeneratedColumn),
    [columns]
  );

  const setColumnName = useCallback((index: number, value: Column["name"]) => {
    setColumns(updateColumn(columnNameLens.set(value))(index));
  }, []);

  const addGeneratedColumn = useCallback((index: number, column: Column) => {
    setColumns((cols) => {
      const c = [...cols];
      c[index] = column;
      return c as readonly Column[];
    });
  }, []);

  const addNewColumn = useCallback(() => {
    setColumns((cols) => {
      return [
        ...cols,
        {
          name: "Header",
          values: [],
        },
      ];
    });
  }, []);

  const deleteColumn = useCallback((index: number) => {
    setColumns((cols) => {
      const c = [...cols];
      c.splice(index, 1);
      return c;
    });
  }, []);

  const headers = useMemo(() => columns, [columns]);

  const longestColumn = useMemo(() => {
    return generatedColumns.reduce((longest, column) => {
      if (O.isNone(longest)) return O.some(column);

      if (longest.value.values.length < column.values.length)
        return O.some(column);

      return longest;
    }, ROA.head(generatedColumns));
  }, [generatedColumns]);

  const rows = useMemo((): O.Option<GeneratedColumn["values"][0]>[][] => {
    if (O.isNone(longestColumn)) return [columns.map(() => O.none)];

    return longestColumn.value.values.map((_, index) => {
      return columns.map((column) => {
        return isGeneratedColumn(column)
          ? O.fromNullable(column.values[index])
          : O.none;
      });
    });
  }, [columns, longestColumn]);

  const columnsForType = useCallback(
    (type: ColumnType) => {
      return generatedColumns.filter((col) => col.type === type);
    },
    [generatedColumns]
  );

  const csv = useMemo(() => {
    if (O.isNone(longestColumn)) return [];

    const dataColumns = longestColumn.value.values.map((_, index) => {
      return generatedColumns.map((column) => {
        return pipe(
          O.fromNullable(column.values[index]),
          O.map(String),
          O.getOrElse(() => "")
        );
      });
    });

    dataColumns.unshift(generatedColumns.map((col) => col.name));
    return dataColumns;
  }, [generatedColumns, longestColumn]);

  return (
    <ColumnContext.Provider
      value={{
        headers,
        rows,
        setColumnName,
        columns,
        columnsForType,
        addGeneratedColumn,
        addNewColumn,
        deleteColumn,
        generatedColumns,
        csv,
      }}
    >
      {props.children}
    </ColumnContext.Provider>
  );
}
