import type { ColumnType, GeneratedColumn } from "./ColumnProvider";
import { useColumns } from "./ColumnProvider";
import * as O from "fp-ts/Option";
import * as Tabs from "@radix-ui/react-tabs";
import classnames from "classnames";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useGeneratorContext } from "~/components/GeneratorContext";
import { pipe } from "fp-ts/lib/function";

export const groupsForColumns = (columns: readonly GeneratedColumn[]) => ({
  numerical: {
    tab: () => <>Numerical</>,
    content: () => (
      <div />
      // <SimpleTabs
      //   labels={{
      //     name: "Name",
      //     age: "Age",
      //   }}
      //   content={{
      //     name: () => <div>Namesies</div>,
      //     age: () => <div>Agesies</div>,
      //   }}
      // />
    ),
  },
  categorical: {
    tab: () => <>Categorical</>,
    content: () => (
      <div />
      // <SimpleTabs
      //   labels={{
      //     name: "Name",
      //     age: "Age",
      //   }}
      //   content={{
      //     name: () => <div>Namesies</div>,
      //     age: () => <div>Agesies</div>,
      //   }}
      // />
    ),
  },
  frequentlyUsed: {
    tab: () => <>Frequently used</>,
    content: () => <FrequentlyUsedContent />,
  },
});

function FrequentlyUsedContent() {
  const { setColumnType } = useGeneratorContext();

  return (
    <>
      <p className="text-base-content">
        Which frequently used column would you like to generate?
      </p>
      <SimpleTabs
        onChange={setColumnType}
        labels={{
          name: "Name",
          age: "Age",
          dob: "DoB",
          email: "Email",
          address: "Address",
        }}
        content={{
          name: () => <Name />,
          email: () => <Email />,
          address: () => null,
          age: () => (
            <AgeRange label="Age" min={0} max={100} correlatesToType="dob" />
          ),
          dob: () => (
            <AgeRange
              label="Date of birth"
              min={0}
              max={100}
              correlatesToType="age"
            />
          ),
        }}
      />
    </>
  );
}

function Name() {
  const { setNameCorrelatesTo, data } = useGeneratorContext();

  return (
    <>
      <CorrelatesTo
        type="email"
        label="Does name correlate to an existing email column?"
        onSelect={setNameCorrelatesTo}
        selected={data.nameCorrelatesTo}
      />
    </>
  );
}

function Email() {
  const { setEmailCorrelatesTo, data } = useGeneratorContext();

  return (
    <>
      <CorrelatesTo
        type="name"
        label="Does email correlate to an existing name column?"
        onSelect={setEmailCorrelatesTo}
        selected={data.emailCorrelatesTo}
      />
    </>
  );
}

type AgeRangeProps = {
  label: string;
  correlatesToType: ColumnType;
  min?: number;
  max?: number;
};

function AgeRange(props: AgeRangeProps) {
  const { correlatesToType, label } = props;
  const { setAgeRangeMax, setAgeRangeMin, setAgeCorrelatesTo, data } =
    useGeneratorContext();
  const { min, max } = props;

  useEffect(() => {
    const optionMax = O.fromNullable(max);
    if (O.isSome(optionMax)) {
      setAgeRangeMax(optionMax.value);
    }
  }, [setAgeRangeMax, max]);

  useEffect(() => {
    const optionMin = O.fromNullable(min);

    if (O.isSome(optionMin)) {
      setAgeRangeMin(optionMin.value);
    }
  }, [min, setAgeRangeMin]);

  return (
    <>
      <CorrelatesTo
        label={`Does ${label} correlate to an existing column?`}
        type={correlatesToType}
        onSelect={setAgeCorrelatesTo}
        selected={data.ageRange.correlatesTo}
      />
      {O.isNone(data.ageRange.correlatesTo) ? (
        <RangeInputs {...props} onMin={setAgeRangeMin} onMax={setAgeRangeMax} />
      ) : null}
    </>
  );
}

type CorrelatesToProps = {
  type: ColumnType;
  label: string;
  onSelect: (c: O.Option<GeneratedColumn>) => void;
  selected: O.Option<GeneratedColumn>;
};

function CorrelatesTo(props: CorrelatesToProps) {
  const { type, label, onSelect, selected } = props;
  const { columnsForType } = useColumns();
  const correlationOptions = useMemo(
    () => columnsForType(type),
    [type, columnsForType]
  );

  return correlationOptions.length > 0 ? (
    <div>
      <span className="text-base-content">{label}</span>
      <br />
      <ColumnsDropdown
        columns={correlationOptions}
        onSelect={onSelect}
        selected={selected}
      />
    </div>
  ) : null;
}

type ColumnsDropdownProps = {
  columns: GeneratedColumn[];
  onSelect: (column: O.Option<GeneratedColumn>) => void;
  selected: O.Option<GeneratedColumn>;
};

function ColumnsDropdown(props: ColumnsDropdownProps) {
  const { columns, onSelect, selected } = props;

  return (
    <select
      className="select select-bordered"
      defaultValue={undefined}
      onChange={(event) => {
        const col = pipe(
          O.fromNullable(event.target.value),
          O.map(parseInt),
          O.chain((value) => O.fromNullable(columns[value]))
        );

        console.log({
          col,
          event,
        });
        onSelect(col);
      }}
    >
      <option value={undefined}>-</option>
      {columns.map((column, index) => {
        return (
          <option key={index} value={`${index}`}>
            {column.name}
          </option>
        );
      })}
    </select>
  );

  // return (
  //   <Select.Root onValueChange={(value) => onSelect(columns[parseInt(value)])}>
  //     <div className="dropdown">
  //       <Select.Trigger className="btn m-1">
  //         {O.isSome(selected) ? selected.value.name : "Pick a column"}
  //       </Select.Trigger>
  //       <Select.Portal>
  //         <Select.Content>
  //           <Select.Viewport className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
  //             {columns.map((column, index) => {
  //               return (
  //                 <Select.Item key={index} value={`${index}`}>
  //                   {column.name}
  //                 </Select.Item>
  //               );
  //             })}
  //           </Select.Viewport>
  //         </Select.Content>
  //       </Select.Portal>
  //     </div>
  //   </Select.Root>
  // );
}

type RangeInputProps = {
  min?: number;
  max?: number;
  onMin: (value: number) => void;
  onMax: (value: number) => void;
};

function RangeInputs(props: RangeInputProps) {
  const { min, max, onMin, onMax } = props;

  return (
    <div className="flex flex-col gap-2">
      <div className="form-control">
        <label htmlFor="min" className="label">
          <span className="label-text-alt">Minimum</span>
        </label>
        <input
          id="min"
          type="number"
          className="input input-bordered invalid:input-bordered invalid:input-error"
          defaultValue={min}
          onChange={(event) => onMin(event.target.valueAsNumber)}
        />
      </div>
      <div className="form-control">
        <label htmlFor="max" className="label">
          <span className="label-text-alt">Maximum</span>
        </label>
        <input
          id="max"
          type="number"
          className="input input-bordered invalid:input-bordered invalid:input-error"
          defaultValue={max}
          onChange={(event) => onMax(event.target.valueAsNumber)}
        />
      </div>
    </div>
  );
}

type SimpleTabsProps<T extends object> = {
  onChange: (value: keyof T) => void;
  labels: {
    [Property in keyof T]: string;
  };
  content: {
    [Property in keyof T]: () => ReactNode;
  };
};

function SimpleTabs<T extends object>(props: SimpleTabsProps<T>) {
  const { onChange } = props;
  const labels = Object.entries(props.labels) as [string, string][];
  const content = Object.entries(props.content) as [string, () => ReactNode][];
  const [activeDataTypeTab, setActiveDataTypeTab] = useState(
    Object.keys(props.labels)[0]
  );

  useEffect(() => {
    onChange(activeDataTypeTab as any);
  }, [onChange, activeDataTypeTab]);

  return (
    <Tabs.Root
      value={activeDataTypeTab}
      onValueChange={(value) => {
        setActiveDataTypeTab(value);
      }}
    >
      <Tabs.List className="tabs">
        {labels.map(([id, label]) => (
          <Tabs.Trigger
            value={id}
            key={id}
            className={classnames(
              "tab tab-bordered",
              activeDataTypeTab === id ? "tab-active" : ""
            )}
          >
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {content.map(([id, _content]) => (
        <Tabs.Content key={id} value={id}>
          {_content()}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 




 */

const generatorGroups2 = {
  numerical: "",
  categorical: "",
  frequentlyUsed: "",
} as const;

export type GeneratorGroup2 = keyof typeof generatorGroups2;

export const keys = <T extends object>(obj: T): (keyof T)[] =>
  Object.keys(obj) as (keyof T)[];

export const generatorGroupsArray = keys(generatorGroups2);
// export const generatorGroupsArray = fromArray<GeneratorGroup2>(keys(generatorGroups2))

export const groupTabsLabels = {
  frequentlyUsed: "Frequently used",
  numerical: "Numerical",
  categorical: "Categorical",
} as const;

export const groupDescriptions = {
  frequentlyUsed: O.some(
    "Which frequently used column would you like to generate?"
  ),
  numerical: O.none,
  categorical: O.none,
} as const;

export const groupGenerators = {
  frequentlyUsed: {
    name: {
      label: "Name",
    },
    age: {
      label: "Age",
    },
  },
  numerical: {},
  categorical: {},
} as const;

export type GeneratorGroupDefinition =
  typeof groupDescriptions[GeneratorGroup2];
