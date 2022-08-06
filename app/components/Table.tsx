import { Header } from "./Column";
import * as O from "fp-ts/Option";
import { useColumns } from "~/utils/ColumnProvider";

type Props = {
  onGenerate: (index: number) => void;
};

const slice = 5;

export function Table(props: Props) {
  const { onGenerate } = props;
  const { headers, rows, setColumnName } = useColumns();

  console.log({
    rows,
  });

  return (
    <div>
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
                    className="btn btn-primary"
                    onClick={() => onGenerate(index)}
                  >
                    Generate {header.name} data
                  </button>
                </td>
              ))}
            </tr>
          ) : (
            <>
              {rows.slice(0, slice).map((row, index) => (
                <tr key={index}>
                  {row.map((cell, index) => (
                    <td key={index}>{O.isNone(cell) ? "-" : cell.value}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td key="ellipsis">
                  <span className="opacity-40">
                    ... ({rows.length - slice} more)
                  </span>
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
