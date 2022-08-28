import { useCSVReader } from "react-papaparse";
import { useMemo, useState } from "react";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import type { Column } from "~/utils/column/column";
import { toCSV } from "~/utils/column/column";
import { fromTable } from "~/utils/column/column";
import { Table } from "~/components/Table";
import { DownloadCSVButton } from "~/components/DownloadCSVButton";

type ParseResult = {
  data: string[][];
  errors: { type: "string"; code: string; message: string }[][];
  meta: unknown[];
};

export default function FromCsv() {
  const { CSVReader } = useCSVReader();
  const [parsedCSV, setParsedCSV] = useState<O.Option<ParseResult>>(O.none);
  const [columns, setColumns] = useState<O.Option<Column[]>>(O.none);

  const uploadAccepted = (results: ParseResult) => {
    // console.log({
    //   results,
    // });
    setParsedCSV(O.some(results));
    setColumns(O.some(fromTable(results.data)));
  };

  const errors = pipe(
    parsedCSV,
    O.map((result) => result.errors)
  );

  const csv = useMemo(
    () => (O.isSome(columns) ? O.some(toCSV(columns.value)) : O.none),
    [columns]
  );

  return (
    <div>
      <div className="flex justify-center">
        <CSVReader onUploadAccepted={uploadAccepted}>
          {({ getRootProps, acceptedFile }: any) => {
            return (
              <div className="flex flex-col gap-2">
                <label>Upload your existing CSV file</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="btn btn-accent btn-outline btn-sm"
                    disabled={O.isSome(parsedCSV)}
                    {...getRootProps()}
                  >
                    Browse...
                  </button>
                  {acceptedFile ? <p>{acceptedFile.name}</p> : null}
                </div>
              </div>
            );
          }}
        </CSVReader>
      </div>

      {O.isSome(csv) && csv.value.length > 0 ? (
        <div className="mt-8">
          <DownloadCSVButton csv={csv.value} />
        </div>
      ) : null}

      <div className="my-8 w-fit mx-auto">
        {O.isSome(errors) && errors.value.length > 0 ? (
          <div className="alert alert-warning shadow-lg">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="flex flex-col">
                <span>Parsed CSV with warnings</span>
                <span>
                  {errors.value.map((error, index) => {
                    return error.map((_error) => (
                      <span key={index}>{_error.message}</span>
                    ));
                  })}
                </span>
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {O.isSome(columns) ? (
        <div className="w-fit mx-auto">
          <Table
            columns={columns.value}
            onColumnsChange={(updated) => setColumns(O.some(updated))}
            onAdd={() => {}}
            onGenerate={() => {}}
          />
        </div>
      ) : null}
    </div>
  );
}
