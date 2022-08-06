import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import classnames from "classnames";
import { groupsForColumns } from "~/utils/configuration";
import type { GeneratorData } from "./GeneratorContext";
import { GeneratorProvider, useGeneratorContext } from "./GeneratorContext";
import { useColumns } from "~/utils/ColumnProvider";
import * as O from "fp-ts/Option";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (data: GeneratorData) => void;
  errors: O.Option<string[]>;
};

export function GenerateDialog(props: Props) {
  return (
    <GeneratorProvider>
      <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/60 fixed top-0 left-0 right-0 bottom-0 grid place-items-center overflow-y-auto" />
          <Dialog.Content className="modal modal-open">
            <div className="modal-box text-white">
              <div className="flex flex-col gap-4">
                <Dialog.Title className="text-lg font-medium text-base-content">
                  What's the type of data you want to generate?
                </Dialog.Title>

                <GroupTabs />

                {O.isSome(props.errors)
                  ? props.errors.value.map((error, index) => (
                      <p className="text-error" key={index}>
                        {error}
                      </p>
                    ))
                  : null}
              </div>
              <div className="modal-action">
                <GenerateButton onClick={props.onGenerate} />
                <Dialog.Close className="btn">Cancel</Dialog.Close>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </GeneratorProvider>
  );
}

function GroupTabs() {
  const { generatedColumns } = useColumns();
  const groups = groupsForColumns(generatedColumns);
  const [activeDataTypeTab, setActiveDataTypeTab] = useState(
    Object.keys(groups)[0]
  );

  return (
    <Tabs.Root
      value={activeDataTypeTab}
      onValueChange={(value) => {
        const v = value as typeof activeDataTypeTab;
        setActiveDataTypeTab(v);
      }}
    >
      <Tabs.List className="tabs">
        {Object.keys(groups)
          .map((v) => v as keyof typeof groups)
          .map((id) => {
            return (
              <Tabs.Trigger
                key={id}
                value={id}
                className={classnames(
                  "tab tab-lifted",
                  activeDataTypeTab === id ? "tab-active" : ""
                )}
              >
                {groups[id].tab()}
              </Tabs.Trigger>
            );
          })}
        {Object.keys(groups)
          .map((v) => v as keyof typeof groups)
          .map((id) => {
            return (
              <Tabs.Content key={id} value={id}>
                <div className="pt-4">{groups[id].content()}</div>
              </Tabs.Content>
            );
          })}
      </Tabs.List>
    </Tabs.Root>
  );
}

type GenerateButtonProps = {
  onClick: (data: GeneratorData) => void;
};

function GenerateButton(props: GenerateButtonProps) {
  const { data } = useGeneratorContext();

  return (
    <button className="btn btn-primary" onClick={() => props.onClick(data)}>
      Generate
    </button>
  );
}
