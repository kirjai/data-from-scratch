import { Lens } from "monocle-ts";
import type { PropsWithChildren } from "react";
import { useCallback } from "react";
import { createContext, useContext, useState } from "react";
import * as O from "fp-ts/Option";
import * as t from "io-ts";
import type { ColumnType, GeneratedColumn } from "~/utils/ColumnProvider";

export type RoundingType = t.TypeOf<typeof RoundingTypeCodec>;
export const RoundingTypeCodec = t.union([
  t.literal("significant"),
  t.literal("decimal"),
]);

type IGeneratorContext = {
  data: GeneratorData;
  setAgeRangeMin: (value: number) => void;
  setAgeRangeMax: (value: number) => void;
  setAgeCorrelatesTo: (value: O.Option<GeneratedColumn>) => void;
  setNameCorrelatesTo: (value: O.Option<GeneratedColumn>) => void;
  setEmailCorrelatesTo: (value: O.Option<GeneratedColumn>) => void;
  setCorrelatedCorrelatesTo: (value: GeneratedColumn) => void;
  setCorrelatedGradient: (value: number) => void;
  setCorrelatedC: (value: number) => void;
  setCorrelatedLoc: (value: number) => void;
  setCorrelatedStandardDeviation: (value: number) => void;
  setRoundingType: (value: O.Option<RoundingType>) => void;
  setRoundingValue: (value: number) => void;
  setColumnType: (column: ColumnType) => void;
};

export type GeneratorData = {
  columnType: O.Option<ColumnType>;
  ageRange: {
    min: O.Option<number>;
    max: O.Option<number>;
    correlatesTo: O.Option<GeneratedColumn>;
  };
  nameCorrelatesTo: O.Option<GeneratedColumn>;
  emailCorrelatesTo: O.Option<GeneratedColumn>;
  correlatedCorrelatesTo: O.Option<GeneratedColumn>;
  correlatedGradient: O.Option<number>;
  correlatedC: O.Option<number>;
  correlatedLoc: O.Option<number>;
  correlatedStandardDeviation: O.Option<number>;
  rounding: {
    type: O.Option<RoundingType>;
    value: O.Option<number>;
  };
};

type AgeRange = GeneratorData["ageRange"];
type Rounding = GeneratorData["rounding"];

const fromGeneratorDataProp = Lens.fromProp<GeneratorData>();
const range = fromGeneratorDataProp("ageRange");
const ageRangeMin = Lens.fromProp<AgeRange>()("min");
const ageRangeMax = Lens.fromProp<AgeRange>()("max");
const ageCorrelatesTo = Lens.fromProp<AgeRange>()("correlatesTo");
const dataAgeRangeMin = range.compose(ageRangeMin);
const dataAgeRangeMax = range.compose(ageRangeMax);
const dataAgeRangeCorrelatesTo = range.compose(ageCorrelatesTo);
const columnType = fromGeneratorDataProp("columnType");
const nameCorrelatesTo = fromGeneratorDataProp("nameCorrelatesTo");
const emailCorrelatesTo = fromGeneratorDataProp("emailCorrelatesTo");
const correlatedCorrelatesTo = fromGeneratorDataProp("correlatedCorrelatesTo");
const correlatedGradient = fromGeneratorDataProp("correlatedGradient");
const correlatedC = fromGeneratorDataProp("correlatedC");
const correlatedLoc = fromGeneratorDataProp("correlatedLoc");
const correlatedStandardDeviation = fromGeneratorDataProp(
  "correlatedStandardDeviation"
);
const rounding = fromGeneratorDataProp("rounding");
const roundingType = rounding.compose(Lens.fromProp<Rounding>()("type"));
const roundingValue = rounding.compose(Lens.fromProp<Rounding>()("value"));

const GeneratorContext = createContext<IGeneratorContext>(null!);

export const useGeneratorContext = () => useContext(GeneratorContext);

export function GeneratorProvider(props: PropsWithChildren<{}>) {
  const [generatorData, setGeneratorData] = useState<GeneratorData>(() => ({
    columnType: O.none,
    ageRange: {
      min: O.none,
      max: O.none,
      correlatesTo: O.none,
    },
    nameCorrelatesTo: O.none,
    emailCorrelatesTo: O.none,
    correlatedCorrelatesTo: O.none,
    correlatedGradient: O.none,
    correlatedC: O.none,
    correlatedLoc: O.none,
    correlatedStandardDeviation: O.none,
    rounding: {
      type: O.none,
      value: O.none,
    },
  }));

  const setAgeRangeMin: IGeneratorContext["setAgeRangeMin"] = useCallback(
    (min) => {
      setGeneratorData(dataAgeRangeMin.set(O.some(min)));
    },
    []
  );
  const setAgeRangeMax: IGeneratorContext["setAgeRangeMax"] = useCallback(
    (max) => {
      setGeneratorData(dataAgeRangeMax.set(O.some(max)));
    },
    []
  );
  const setColumnType: IGeneratorContext["setColumnType"] = useCallback(
    (type) => {
      setGeneratorData(columnType.set(O.some(type)));
    },
    []
  );
  const setAgeCorrelatesTo: IGeneratorContext["setAgeCorrelatesTo"] =
    useCallback((column) => {
      setGeneratorData(dataAgeRangeCorrelatesTo.set(column));
    }, []);
  const setNameCorrelatesTo: IGeneratorContext["setNameCorrelatesTo"] =
    useCallback((column) => {
      setGeneratorData(nameCorrelatesTo.set(column));
    }, []);
  const setEmailCorrelatesTo: IGeneratorContext["setEmailCorrelatesTo"] =
    useCallback((column) => {
      setGeneratorData(emailCorrelatesTo.set(column));
    }, []);
  const setCorrelatedCorrelatesTo: IGeneratorContext["setCorrelatedCorrelatesTo"] =
    useCallback((column) => {
      setGeneratorData(correlatedCorrelatesTo.set(O.some(column)));
    }, []);
  const setCorrelatedGradient: IGeneratorContext["setCorrelatedGradient"] =
    useCallback((value) => {
      setGeneratorData(correlatedGradient.set(O.some(value)));
    }, []);
  const setCorrelatedC: IGeneratorContext["setCorrelatedC"] = useCallback(
    (value) => {
      setGeneratorData(correlatedC.set(O.some(value)));
    },
    []
  );
  const setCorrelatedLoc: IGeneratorContext["setCorrelatedLoc"] = useCallback(
    (value) => {
      setGeneratorData(correlatedLoc.set(O.some(value)));
    },
    []
  );
  const setCorrelatedStandardDeviation: IGeneratorContext["setCorrelatedStandardDeviation"] =
    useCallback((value) => {
      setGeneratorData(correlatedStandardDeviation.set(O.some(value)));
    }, []);
  const setRoundingType: IGeneratorContext["setRoundingType"] = useCallback(
    (value) => {
      setGeneratorData(roundingType.set(value));
    },
    []
  );
  const setRoundingValue: IGeneratorContext["setRoundingValue"] = useCallback(
    (value) => {
      setGeneratorData(roundingValue.set(O.some(value)));
    },
    []
  );

  return (
    <GeneratorContext.Provider
      value={{
        setAgeRangeMin,
        setAgeRangeMax,
        setColumnType,
        setAgeCorrelatesTo,
        setNameCorrelatesTo,
        setEmailCorrelatesTo,
        setCorrelatedCorrelatesTo,
        setCorrelatedGradient,
        setCorrelatedC,
        setCorrelatedLoc,
        setCorrelatedStandardDeviation,
        setRoundingType,
        setRoundingValue,
        data: generatorData,
      }}
    >
      {props.children}
    </GeneratorContext.Provider>
  );
}
