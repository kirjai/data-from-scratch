import { Header } from "./Column";
import * as O from "fp-ts/Option";
import { useColumns } from "~/utils/ColumnProvider";

export function Table() {
  const { headers, rows, setColumnName } = useColumns();

  return (
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
            <td>
              <button className="btn btn-primary">
                Generate data for this column
              </button>
            </td>
          </tr>
        ) : (
          rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, index) => (
                <td key={index}>{O.isNone(cell) ? "-" : cell.value}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
