import type { ColumnType, GeneratedColumn } from "./ColumnProvider";
import { numericalColumnTypes } from "./ColumnProvider";
import { useColumns } from "./ColumnProvider";
import * as O from "fp-ts/Option";
import * as Tabs from "@radix-ui/react-tabs";
import classnames from "classnames";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useEffect } from "react";
import { useState } from "react";
import type { RoundingType } from "~/components/GeneratorContext";
import { useGeneratorContext } from "~/components/GeneratorContext";
import { pipe } from "fp-ts/lib/function";

export const groupsForColumns = (columns: readonly GeneratedColumn[]) => ({
  numerical: {
    tab: () => <>Numerical</>,
    content: () => <Numerical />,
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
  correlated: {
    tab: () => <>Correlated</>,
    content: () => <Correlated />,
  },
});

function Numerical() {
  const { setColumnType } = useGeneratorContext();

  return (
    <SimpleTabs
      onChange={setColumnType}
      labels={{
        gamma: "Gamma distribution",
        uniform: "Uniform distribution",
        normal: "Normal distribution",
      }}
      content={{
        gamma: () => <Gamma />,
        uniform: () => <Uniform />,
        normal: () => <Normal />,
      }}
    />
  );
}

function Uniform() {
  const { setUniformMin, setUniformMax, data } = useGeneratorContext();

  return (
    <div>
      <NumberInput
        defaultValue={0}
        value={O.getOrElse(() => "" as any)(data.uniform.min)}
        onChange={setUniformMin}
        label="Min"
      />
      <NumberInput
        defaultValue={100}
        value={O.getOrElse(() => "" as any)(data.uniform.max)}
        onChange={setUniformMax}
        label="Max"
      />
    </div>
  );
}

function Normal() {
  const { setNormalMean, setNormalStandardDeviation, data } =
    useGeneratorContext();

  return (
    <div>
      <NumberInput
        defaultValue={1}
        value={O.getOrElse(() => "" as any)(data.normal.mean)}
        onChange={setNormalMean}
        label="Mean"
      />
      <NumberInput
        defaultValue={1}
        value={O.getOrElse(() => "" as any)(data.normal.standardDeviation)}
        onChange={setNormalStandardDeviation}
        label="Standard deviation"
      />
    </div>
  );
}

function Gamma() {
  const { setGammaMean, setGammaStandardDeviation, data } =
    useGeneratorContext();

  return (
    <div>
      <NumberInput
        defaultValue={1}
        value={O.getOrElse(() => "" as any)(data.gamma.mean)}
        onChange={setGammaMean}
        label="Mean"
      />
      <NumberInput
        defaultValue={1}
        value={O.getOrElse(() => "" as any)(data.gamma.standardDeviation)}
        onChange={setGammaStandardDeviation}
        label="Standard deviation"
      />
    </div>
  );
}

function Correlated() {
  const {
    setCorrelatedCorrelatesTo,
    data,
    setColumnType,
    setCorrelatedGradient,
    setCorrelatedC,
    setCorrelatedLoc,
    setCorrelatedStandardDeviation,
  } = useGeneratorContext();

  const onSelect = (value: O.Option<GeneratedColumn>) => {
    if (O.isSome(value)) {
      console.log("setting", {
        v: value.value,
      });
      setCorrelatedCorrelatesTo(value.value);
      setColumnType("correlated");
    }
  };

  const selected = data.correlated.correlatesTo;

  return (
    <div className="flex flex-col gap-4">
      <CorrelatesTo
        types={[...numericalColumnTypes]}
        label="Which numerical column does it correlate to?"
        onSelect={onSelect}
        selected={selected}
        onNoOptions={() => (
          <p className="text-error">
            No columns to correlate to are available. Cannot create a correlated
            column.
          </p>
        )}
      />
      {O.isSome(selected) ? (
        <>
          <div className="divider" />

          <div className="flex flex-col gap-1">
            <NumberInput
              defaultValue={1}
              value={
                O.isSome(data.correlated.gradient)
                  ? data.correlated.gradient.value
                  : ""
              }
              onChange={setCorrelatedGradient}
              label="Gradient"
            />
            <NumberInput
              defaultValue={1}
              value={O.isSome(data.correlated.c) ? data.correlated.c.value : ""}
              onChange={setCorrelatedC}
              label="c"
            />
            <NumberInput
              defaultValue={1}
              value={
                O.isSome(data.correlated.loc) ? data.correlated.loc.value : ""
              }
              onChange={setCorrelatedLoc}
              label="Mean"
            />
            <NumberInput
              defaultValue={1}
              value={
                O.isSome(data.correlated.standardDeviation)
                  ? data.correlated.standardDeviation.value
                  : ""
              }
              onChange={setCorrelatedStandardDeviation}
              label="Standard deviation"
            />

            <div className="divider" />

            <Rounding />
          </div>
        </>
      ) : null}
      <div></div>
    </div>
  );
}

function Rounding() {
  const { data, setRoundingType, setRoundingValue } = useGeneratorContext();

  const significant: RoundingType = "significant";
  const decimal: RoundingType = "decimal";

  const select = (value: O.Option<RoundingType>) => (checked: boolean) => {
    return checked ? setRoundingType(value) : {};
  };

  const label = pipe(
    data.rounding.type,
    O.map((v) => {
      switch (v) {
        case "significant":
          return "How many significant digits?";
        case "decimal":
          return "How many decimal places?";
        default:
          return "How many?";
      }
    })
  );

  return (
    <div>
      <Radio
        value="none"
        label="None"
        checked={O.isNone(data.rounding.type)}
        onChange={select(O.none)}
      />
      <Radio
        value={significant}
        label="Significant digits"
        onChange={select(O.some(significant))}
        checked={
          O.isSome(data.rounding.type) &&
          data.rounding.type.value === significant
        }
      />
      <Radio
        value={decimal}
        label="Decimal places"
        onChange={select(O.some(decimal))}
        checked={
          O.isSome(data.rounding.type) && data.rounding.type.value === decimal
        }
      />
      {O.isSome(data.rounding.type) ? (
        <NumberInput
          defaultValue={5}
          min={0}
          value={O.isSome(data.rounding.value) ? data.rounding.value.value : ""}
          label={O.isSome(label) ? label.value : ""}
          onChange={setRoundingValue}
        />
      ) : null}
    </div>
  );
}

type RadioProps = {
  checked: boolean;
  value: string;
  label: string;
  onChange: (value: boolean) => void;
};

function Radio(props: RadioProps) {
  return (
    <div className="form-control">
      <label className="label cursor-pointer">
        <span className="label-text">{props.label}</span>
        <input
          className="radio radio-primary"
          type="radio"
          value={props.value}
          checked={props.checked}
          onChange={(event) => props.onChange(event.target.checked)}
        />
      </label>
    </div>
  );
}

function FrequentlyUsedContent() {
  const { setColumnType } = useGeneratorContext();

  return (
    <div className="flex flex-col gap-2">
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
    </div>
  );
}

function Name() {
  const { setNameCorrelatesTo, data } = useGeneratorContext();

  return (
    <>
      <CorrelatesTo
        types={["email"]}
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
        types={["name"]}
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
        types={[correlatesToType]}
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
  types: ColumnType[];
  label: string;
  onSelect: (c: O.Option<GeneratedColumn>) => void;
  selected: O.Option<GeneratedColumn>;
  onNoOptions?: () => JSX.Element;
};

function CorrelatesTo(props: CorrelatesToProps) {
  const { types, label, onSelect, selected, onNoOptions = () => null } = props;
  const { columnsForType } = useColumns();
  const correlationOptions = useMemo(
    () => types.map((type) => columnsForType(type)).flat(),
    [types, columnsForType]
  );

  return correlationOptions.length > 0 ? (
    <div className="flex flex-col gap-2">
      <span className="text-base-content">{label}</span>
      <ColumnsDropdown
        columns={correlationOptions}
        onSelect={onSelect}
        selected={selected}
      />
    </div>
  ) : (
    onNoOptions()
  );
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

type NumberInputProps = {
  defaultValue?: number;
  value: number | "";
  label?: string;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
};

function NumberInput(props: NumberInputProps) {
  const { value, onChange, label, defaultValue, min, max } = props;

  useEffect(() => {
    const option = O.fromNullable(defaultValue);
    if (O.isSome(option)) {
      onChange(option.value);
    }
  }, [defaultValue, onChange]);

  return (
    <div className="form-control">
      <label htmlFor="max" className="label">
        <span className="label-text-alt">{label}</span>
      </label>
      <input
        type="number"
        className="input input-bordered invalid:input-bordered invalid:input-error"
        value={value}
        onChange={(event) => onChange(event.target.valueAsNumber)}
        min={min}
        max={max}
      />
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
          <div className="pt-2">{_content()}</div>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
