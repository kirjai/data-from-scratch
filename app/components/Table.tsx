import { Header } from "./Column";
import * as O from "fp-ts/Option";
import { isGeneratedColumn, useColumns } from "~/utils/ColumnProvider";

type Props = {
  onGenerate: (index: number) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
};

const slice = 5;

export function Table(props: Props) {
  const { onGenerate, onAdd, onDelete } = props;
  const { headers, rows, setColumnName, columns } = useColumns();

  console.log({
    rows,
  });

  return (
    <div className="flex">
      <table className="table w-full">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>
                <Header
                  name={header.name}
                  setName={(name) => setColumnName(index, name)}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              {headers.map((header, index) => (
                <td key={index}>
                  <button
                    className="btn btn-primary btn-outline"
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
                          className="btn btn-primary btn-outline"
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
                  <td>
                    <span className="opacity-40">
                      ... ({rows.length - slice} more)
                    </span>
                  </td>
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
//   className="btn btn-primary btn-outline"
//   onClick={() => onGenerate(index)}
// >
//   Generate {header.name} data
// </button>
// }
