import { Lens } from "monocle-ts";
import type { PropsWithChildren } from "react";
import { useCallback } from "react";
import { createContext, useContext, useState } from "react";
import * as O from "fp-ts/Option";
import type { Column, ColumnType } from "~/utils/ColumnProvider";

type IGeneratorContext = {
  data: GeneratorData;
  setAgeRangeMin: (value: number) => void;
  setAgeRangeMax: (value: number) => void;
  setAgeCorrelatesTo: (value: Column) => void;
  setNameCorrelatesTo: (value: Column) => void;
  setEmailCorrelatesTo: (value: Column) => void;
  setColumnType: (column: ColumnType) => void;
};

export type GeneratorData = {
  columnType: O.Option<ColumnType>;
  ageRange: {
    min: O.Option<number>;
    max: O.Option<number>;
    correlatesTo: O.Option<Column>;
  };
  nameCorrelatesTo: O.Option<Column>;
  emailCorrelatesTo: O.Option<Column>;
};

type AgeRange = GeneratorData["ageRange"];

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
      setGeneratorData(dataAgeRangeCorrelatesTo.set(O.some(column)));
    }, []);
  const setNameCorrelatesTo: IGeneratorContext["setNameCorrelatesTo"] =
    useCallback((column) => {
      setGeneratorData(nameCorrelatesTo.set(O.some(column)));
    }, []);
  const setEmailCorrelatesTo: IGeneratorContext["setEmailCorrelatesTo"] =
    useCallback((column) => {
      setGeneratorData(emailCorrelatesTo.set(O.some(column)));
    }, []);

  return (
    <GeneratorContext.Provider
      value={{
        setAgeRangeMin,
        setAgeRangeMax,
        setColumnType,
        setAgeCorrelatesTo,
        setNameCorrelatesTo,
        setEmailCorrelatesTo,
        data: generatorData,
      }}
    >
      {props.children}
    </GeneratorContext.Provider>
  );
}
