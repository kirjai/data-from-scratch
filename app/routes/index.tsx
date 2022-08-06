// @ts-expect-error
import { useClippy } from "@react95/clippy";
import { useEffect, useState } from "react";
import { GenerateDialog } from "~/components/GenerateDialog";
import type { GeneratorData } from "~/components/GeneratorContext";
import { Table } from "~/components/Table";
import { useColumns } from "~/utils/ColumnProvider";
import { generate } from "~/utils/generators";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { CSVLink } from "react-csv";

export default function Index() {
  const { clippy } = useClippy();
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const {
    headers,
    addGeneratedColumn,
    addNewColumn,
    generatedColumns,
    deleteColumn,
    csv,
  } = useColumns();
  const isFirstColumn = headers.length === 1 && generatedColumns.length === 0;
  const [samples, setSamples] = useState(100);
  const [generatingForIndex, setGeneratingForIndex] = useState(-1);
  const [errors, setErrors] = useState<O.Option<string[]>>(O.none);

  useEffect(() => {
    if (clippy) {
      console.log(clippy.animations());
    }
  }, [clippy]);

  useEffect(() => {
    if (clippy) {
      clippy?.play("Greeting");
    }
  }, [clippy]);

  const onGenerate = (data: GeneratorData) => {
    const header = O.fromNullable(headers[generatingForIndex]);

    if (O.isNone(header))
      return setErrors(
        O.some([
          `(internal error) unknown column for index ${generatingForIndex}`,
        ])
      );

    const generated = generate(samples, generatedColumns, data);

    if (E.isRight(generated)) {
      addGeneratedColumn(generatingForIndex, {
        type: generated.right.type,
        values: generated.right.values,
        name: header.value.name,
      });
      setGenerateDialogOpen(false);
      setErrors(O.none);
    } else {
      setErrors(O.some(generated.left));
    }
  };

  return (
    <>
      <div className="max-w-screen-xl	px-10">
        <div className="pt-10">
          <h1 className="font-bold text-4xl pb-4 text-center">
            Data from scratch
          </h1>

          <div className="flex justify-center mt-10">
            <div className="flex flex-col gap-10">
              <div className="form-control">
                <label className="label justify-center" htmlFor="samples">
                  <span className="label-text">
                    How many samples to generate?
                  </span>
                </label>
                <div className="flex justify-center">
                  <input
                    id="samples"
                    type="number"
                    className="input input-bordered w-32 input-lg invalid:input-bordered invalid:input-error"
                    value={samples}
                    onChange={(event) => setSamples(event.target.valueAsNumber)}
                    min="0"
                  />
                </div>
              </div>

              {generatedColumns.length > 0 ? (
                <div className="text-center flex flex-col gap-4">
                  <p>Ready to save the generated data as a CSV?</p>
                  <div>
                    <CSVLink
                      data={csv}
                      target="_blank"
                      className="btn btn-primary"
                      filename="data-from-scratch.csv"
                    >
                      Download CSV
                    </CSVLink>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-4">
                {isFirstColumn ? (
                  <div className="text-center">
                    <p className="text-xl font-medium mb-1">
                      ⬇️ This is your first column ⬇️
                    </p>
                    <p className="text-sm opacity-60">
                      Click the header to edit the name ✏️
                    </p>
                  </div>
                ) : null}

                <div className="p-10 border border-base-300 rounded-2xl">
                  <Table
                    onGenerate={(index) => {
                      setGeneratingForIndex(index);
                      setGenerateDialogOpen(true);
                    }}
                    onAdd={addNewColumn}
                    onDelete={deleteColumn}
                  />
                </div>
              </div>
            </div>
            <GenerateDialog
              key={String(generateDialogOpen)}
              open={generateDialogOpen}
              onOpenChange={setGenerateDialogOpen}
              onGenerate={onGenerate}
              errors={errors}
            />
          </div>
        </div>
      </div>
    </>
  );
}
