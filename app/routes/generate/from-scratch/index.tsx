import { useState } from "react";
import { GenerateDialog } from "~/components/GenerateDialog";
import type { GeneratorData } from "~/components/GeneratorContext";
import { DEPRECATEDTable } from "~/components/Table";
import { useColumns } from "~/utils/DEPRECATEDColumnProvider";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { generate } from "~/utils/generators";
import { DownloadCSVButton } from "~/components/DownloadCSVButton";

export default function FromScratch() {
  const {
    headers,
    addGeneratedColumn,
    addNewColumn,
    generatedColumns,
    deleteColumn,
    csv,
  } = useColumns();
  const isFirstColumn = headers.length === 1 && generatedColumns.length === 0;
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [samples, setSamples] = useState(100);
  const [generatingForIndex, setGeneratingForIndex] = useState(-1);
  const [errors, setErrors] = useState<O.Option<string[]>>(O.none);

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
    <div className="w-fit mx-auto gap-10 flex flex-col">
      <div className="form-control">
        <label className="label justify-center" htmlFor="samples">
          <span className="label-text">How many samples to generate?</span>
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

      {generatedColumns.length > 0 ? <DownloadCSVButton csv={csv} /> : null}
      <div className="flex flex-col gap-4">
        {isFirstColumn ? (
          <div className="text-center">
            <p className="text-xl font-medium mb-1">
              ?????? This is your first column ??????
            </p>
            <p className="text-sm opacity-60">
              Click the header to edit the name ??????
            </p>
          </div>
        ) : null}

        <div className="p-10 border border-base-300 rounded-2xl">
          <DEPRECATEDTable
            onGenerate={(index) => {
              setGeneratingForIndex(index);
              setGenerateDialogOpen(true);
            }}
            onAdd={addNewColumn}
            onDelete={deleteColumn}
          />
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
  );
}
