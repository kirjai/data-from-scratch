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
  setGammaMean: (value: number) => void;
  setGammaStandardDeviation: (value: number) => void;
  setNormalMean: (value: number) => void;
  setNormalStandardDeviation: (value: number) => void;
  setUniformMin: (value: number) => void;
  setUniformMax: (value: number) => void;
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
  correlated: {
    correlatesTo: O.Option<GeneratedColumn>;
    gradient: O.Option<number>;
    c: O.Option<number>;
    loc: O.Option<number>;
    standardDeviation: O.Option<number>;
  };
  gamma: {
    mean: O.Option<number>;
    standardDeviation: O.Option<number>;
  };
  rounding: {
    type: O.Option<RoundingType>;
    value: O.Option<number>;
  };
  uniform: {
    min: O.Option<number>;
    max: O.Option<number>;
  };
  normal: {
    mean: O.Option<number>;
    standardDeviation: O.Option<number>;
  };
};

type AgeRange = GeneratorData["ageRange"];
type Rounding = GeneratorData["rounding"];
type Correlated = GeneratorData["correlated"];
type Gamma = GeneratorData["gamma"];
type Uniform = GeneratorData["uniform"];
type Normal = GeneratorData["normal"];

const fromGeneratorDataProp = Lens.fromProp<GeneratorData>();
const range = fromGeneratorDataProp("ageRange");
const correlated = fromGeneratorDataProp("correlated");
const gamma = fromGeneratorDataProp("gamma");
const normal = fromGeneratorDataProp("normal");
const uniform = fromGeneratorDataProp("uniform");
const ageRangeMin = Lens.fromProp<AgeRange>()("min");
const ageRangeMax = Lens.fromProp<AgeRange>()("max");
const ageCorrelatesTo = Lens.fromProp<AgeRange>()("correlatesTo");
const dataAgeRangeMin = range.compose(ageRangeMin);
const dataAgeRangeMax = range.compose(ageRangeMax);
const dataAgeRangeCorrelatesTo = range.compose(ageCorrelatesTo);
const columnType = fromGeneratorDataProp("columnType");
const nameCorrelatesTo = fromGeneratorDataProp("nameCorrelatesTo");
const emailCorrelatesTo = fromGeneratorDataProp("emailCorrelatesTo");
const correlatedCorrelatesTo = correlated.compose(
  Lens.fromProp<Correlated>()("correlatesTo")
);
const correlatedGradient = correlated.compose(
  Lens.fromProp<Correlated>()("gradient")
);
const correlatedC = correlated.compose(Lens.fromProp<Correlated>()("c"));
const correlatedLoc = correlated.compose(Lens.fromProp<Correlated>()("loc"));
const correlatedStandardDeviation = correlated.compose(
  Lens.fromProp<Correlated>()("standardDeviation")
);
const gammaMean = gamma.compose(Lens.fromProp<Gamma>()("mean"));
const gammaStandardDeviation = gamma.compose(
  Lens.fromProp<Gamma>()("standardDeviation")
);
const normalMean = normal.compose(Lens.fromProp<Normal>()("mean"));
const normalStandardDeviation = normal.compose(
  Lens.fromProp<Normal>()("standardDeviation")
);
const uniformMin = uniform.compose(Lens.fromProp<Uniform>()("min"));
const uniformMax = uniform.compose(Lens.fromProp<Uniform>()("max"));
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
    correlated: {
      correlatesTo: O.none,
      gradient: O.none,
      c: O.none,
      loc: O.none,
      standardDeviation: O.none,
    },
    gamma: {
      mean: O.none,
      standardDeviation: O.none,
    },
    uniform: {
      min: O.none,
      max: O.none,
    },
    normal: {
      mean: O.none,
      standardDeviation: O.none,
    },
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
  const setGammaMean: IGeneratorContext["setGammaMean"] = useCallback(
    (value) => {
      setGeneratorData(gammaMean.set(O.some(value)));
    },
    []
  );
  const setGammaStandardDeviation: IGeneratorContext["setGammaStandardDeviation"] =
    useCallback((value) => {
      setGeneratorData(gammaStandardDeviation.set(O.some(value)));
    }, []);
  const setNormalMean: IGeneratorContext["setNormalMean"] = useCallback(
    (value) => {
      setGeneratorData(normalMean.set(O.some(value)));
    },
    []
  );
  const setNormalStandardDeviation: IGeneratorContext["setNormalStandardDeviation"] =
    useCallback((value) => {
      setGeneratorData(normalStandardDeviation.set(O.some(value)));
    }, []);
  const setUniformMin: IGeneratorContext["setUniformMin"] = useCallback(
    (value) => {
      setGeneratorData(uniformMin.set(O.some(value)));
    },
    []
  );
  const setUniformMax: IGeneratorContext["setUniformMax"] = useCallback(
    (value) => {
      setGeneratorData(uniformMax.set(O.some(value)));
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
        setGammaMean,
        setNormalMean,
        setNormalStandardDeviation,
        setUniformMin,
        setUniformMax,
        setGammaStandardDeviation,
        data: generatorData,
      }}
    >
      {props.children}
    </GeneratorContext.Provider>
  );
}
