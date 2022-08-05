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

type Column = {
  name: string;
  values: {}[];
};

const ColumnContext = createContext<{
  headers: readonly Column[];
  rows: O.Option<Column["values"][0]>[][];
  setColumnName: (index: number, name: Column["name"]) => void;
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
      name: "Header (edit me)",
      values: [],
    },
  ]);

  const setColumnName = useCallback((index: number, value: Column["name"]) => {
    setColumns(updateColumn(columnNameLens.set(value))(index));
  }, []);

  const headers = useMemo(() => columns, [columns]);

  const rows = useMemo((): O.Option<Column["values"][0]>[][] => {
    const longestColumn = columns.reduce((longest, column) => {
      if (O.isNone(longest)) return O.some(column);

      if (longest.value.values.length < column.values.length)
        return O.some(column);

      return longest;
    }, ROA.head(columns));

    if (O.isNone(longestColumn)) return [columns.map(() => O.none)];

    return longestColumn.value.values.map((_, index) => {
      return columns.map((column) => {
        return O.fromNullable(column.values[index]);
      });
    });
  }, [columns]);

  return (
    <ColumnContext.Provider
      value={{
        headers,
        rows,
        setColumnName,
      }}
    >
      {props.children}
    </ColumnContext.Provider>
  );
}
