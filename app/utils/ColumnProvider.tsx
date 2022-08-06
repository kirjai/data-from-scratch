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
import { pipe } from "fp-ts/lib/function";

export type ColumnType = "name" | "age" | "dob" | "email" | "address";

export type ColumnValue = any;

export type Column = {
  type: ColumnType;
  name: string;
  values: ColumnValue[];
};

const ColumnContext = createContext<{
  headers: readonly Omit<Column, "type">[];
  rows: O.Option<Column["values"][0]>[][];
  setColumnName: (index: number, name: Column["name"]) => void;
  columns: readonly Column[];
  columnsForType: (type: ColumnType) => Column[];
  addGeneratedColumn: (index: number, column: Column) => void;
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
  const [columns, setColumns] = useState<readonly Column[]>(() => []);

  const setColumnName = useCallback((index: number, value: Column["name"]) => {
    setColumns(updateColumn(columnNameLens.set(value))(index));
  }, []);

  const addGeneratedColumn = useCallback((index: number, column: Column) => {
    setColumns((cols) => {
      console.log({
        cols,
      });
      const c = [...cols];
      c[index] = column;
      return c as readonly Column[];
    });
  }, []);

  const headers = useMemo(
    () =>
      columns.length > 0
        ? (columns as readonly Omit<Column, "type">[])
        : [{ name: "Header", values: [] }],
    [columns]
  );

  const rows = useMemo((): O.Option<Column["values"][0]>[][] => {
    const longestColumn = columns.reduce((longest, column) => {
      if (O.isNone(longest)) return O.some(column);

      if (longest.value.values.length < column.values.length)
        return O.some(column);

      return longest;
    }, ROA.head(columns));

    if (O.isNone(longestColumn)) return [];

    return longestColumn.value.values.map((_, index) => {
      return columns.map((column) => {
        return O.fromNullable(column.values[index]);
      });
    });
  }, [columns]);

  const columnsForType = useCallback(
    (type: ColumnType) => {
      return columns.filter((col) => col.type === type);
    },
    [columns]
  );

  return (
    <ColumnContext.Provider
      value={{
        headers,
        rows,
        setColumnName,
        columns,
        columnsForType,
        addGeneratedColumn,
      }}
    >
      {props.children}
    </ColumnContext.Provider>
  );
}
