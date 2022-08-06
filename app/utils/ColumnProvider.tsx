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

export type EmptyColumn = Omit<GeneratedColumn, "type" | "values">;
export type GeneratedColumn = {
  type: ColumnType;
  name: string;
  values: ColumnValue[];
};

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

  const rows = useMemo((): O.Option<GeneratedColumn["values"][0]>[][] => {
    const longestColumn = generatedColumns.reduce((longest, column) => {
      if (O.isNone(longest)) return O.some(column);

      if (longest.value.values.length < column.values.length)
        return O.some(column);

      return longest;
    }, ROA.head(generatedColumns));

    if (O.isNone(longestColumn)) return [columns.map(() => O.none)];

    return longestColumn.value.values.map((_, index) => {
      return columns.map((column) => {
        return isGeneratedColumn(column)
          ? O.fromNullable(column.values[index])
          : O.none;
      });
    });
  }, [generatedColumns, columns]);

  const columnsForType = useCallback(
    (type: ColumnType) => {
      return generatedColumns.filter((col) => col.type === type);
    },
    [generatedColumns]
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
        addNewColumn,
        deleteColumn,
        generatedColumns,
      }}
    >
      {props.children}
    </ColumnContext.Provider>
  );
}
