import { Header } from "./Column";
import * as O from "fp-ts/Option";
import * as A from "fp-ts/Array";
import {
  isGeneratedColumn,
  useColumns,
} from "~/utils/DEPRECATEDColumnProvider";
import { Column, columnNameLens, toRows } from "~/utils/column/column";
import { useMemo } from "react";
import { fromColumns } from "~/utils/column/header";

type DEPRECATEDProps = {
  onGenerate: (index: number) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
};
type Props = {
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  onGenerate: (index: number) => void;
  onAdd: () => void;
};

const slice = 5;

export function Table(props: Props) {
  const { columns, onAdd, onColumnsChange, onGenerate } = props;
  const headers = useMemo(() => fromColumns(columns), [columns]);
  const rows = useMemo(() => toRows(columns), [columns]);

  const updateColumns = (updated: O.Option<Column[]>) => {
    if (O.isSome(updated)) {
      onColumnsChange(updated.value);
    }
  };

  const updateColumnName = (index: number, name: Column["name"]) => {
    updateColumns(A.modifyAt(index, columnNameLens.set(name))(columns));
  };

  const deleteColumn = (index: number) => {
    updateColumns(A.deleteAt(index)(columns));
  };

  return (
    <div className="flex">
      <table className="table w-full">
        <thead>
          <tr>
            {headers.map((header, index) => {
              const column = columns[index];
              return (
                <th key={index}>
                  <Header
                    type={
                      Column.is.GeneratedColumn(column)
                        ? column.columnType
                        : undefined
                    }
                    name={header.name}
                    setName={(name) => updateColumnName(index, name)}
                  />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              {headers.map((header, index) => (
                <td key={index}>
                  <button
                    className="btn btn-accent btn-outline"
                    onClick={() => onGenerate(index)}
                  >
                    Generate {header.name} data
                  </button>
                </td>
              ))}
            </tr>
          ) : (
            <>
              {rows.slice(0, slice).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => {
                    if (
                      isGeneratedColumn(columns[cellIndex]) ||
                      rowIndex !== 0
                    ) {
                      return (
                        <td key={cellIndex}>
                          {O.isNone(cell) ? "" : cell.value}
                        </td>
                      );
                    }

                    return (
                      <td key={cellIndex}>
                        <button
                          className="btn btn-accent btn-outline"
                          onClick={() => onGenerate(cellIndex)}
                        >
                          Generate data
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {rows.length - slice > 0 ? (
                <tr>
                  {columns.map((column, index) => {
                    if (!isGeneratedColumn(column)) return null;

                    return (
                      <td key={index}>
                        <span className="opacity-40">
                          ... ({rows.length - slice} more)
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ) : null}
              {columns.length > 1 ? (
                <tr>
                  {columns.map((_, index) => {
                    return (
                      <td key={index}>
                        <button
                          className="opacity-40 btn btn-xs btn-outline btn-error"
                          onClick={() => deleteColumn(index)}
                        >
                          Delete column
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ) : null}
            </>
          )}
        </tbody>
      </table>

      {/* <button
        className="btn btn-square text-xl mt-1 ml-4"
        title="Add another column"
        onClick={onAdd}
      >
        +
      </button> */}
    </div>
  );
}

/**
 * @deprecated
 */
export function DEPRECATEDTable(props: DEPRECATEDProps) {
  const { onGenerate, onAdd, onDelete } = props;
  const { headers, rows, setColumnName, columns } = useColumns();

  return (
    <div className="flex">
      <table className="table w-full">
        <thead>
          <tr>
            {headers.map((header, index) => {
              const col = columns[index];
              return (
                <th key={index}>
                  <Header
                    type={isGeneratedColumn(col) ? col.type : undefined}
                    name={header.name}
                    setName={(name) => setColumnName(index, name)}
                  />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              {headers.map((header, index) => (
                <td key={index}>
                  <button
                    className="btn btn-accent btn-outline"
                    onClick={() => onGenerate(index)}
                  >
                    Generate {header.name} data
                  </button>
                </td>
              ))}
            </tr>
          ) : (
            <>
              {rows.slice(0, slice).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => {
                    if (
                      isGeneratedColumn(columns[cellIndex]) ||
                      rowIndex !== 0
                    ) {
                      return (
                        <td key={cellIndex}>
                          {O.isNone(cell) ? "" : cell.value}
                        </td>
                      );
                    }

                    return (
                      <td key={cellIndex}>
                        <button
                          className="btn btn-accent btn-outline"
                          onClick={() => onGenerate(cellIndex)}
                        >
                          Generate data
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {rows.length - slice > 0 ? (
                <tr>
                  {columns.map((column, index) => {
                    if (!isGeneratedColumn(column)) return null;

                    return (
                      <td key={index}>
                        <span className="opacity-40">
                          ... ({rows.length - slice} more)
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ) : null}
              {columns.length > 1 ? (
                <tr>
                  {columns.map((_, index) => {
                    return (
                      <td key={index}>
                        <button
                          className="opacity-40 btn btn-xs btn-outline btn-error"
                          onClick={() => onDelete(index)}
                        >
                          Delete column
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ) : null}
            </>
          )}
        </tbody>
      </table>

      <button
        className="btn btn-square text-xl mt-1 ml-4"
        title="Add another column"
        onClick={onAdd}
      >
        +
      </button>
    </div>
  );
}

// function GenerateButton() {
//   return <button
//   className="btn btn-accent btn-outline"
//   onClick={() => onGenerate(index)}
// >
//   Generate {header.name} data
// </button>
// }
