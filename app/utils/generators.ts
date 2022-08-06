import type {
  GeneratorData,
  RoundingType,
} from "~/components/GeneratorContext";
import { RoundingTypeCodec } from "~/components/GeneratorContext";
import type {
  ColumnType,
  ColumnValue,
  GeneratedColumn,
} from "./ColumnProvider";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as t from "io-ts";
import { pipe } from "fp-ts/lib/function";
import { faker as enGBFaker } from "@faker-js/faker/locale/en_GB";
import { differenceInYears, format, parse, subDays, subYears } from "date-fns";
import { NumberFromString, option } from "io-ts-types";
import normal from "@stdlib/random/base/normal";
import stdGamma from "@stdlib/random/base/gamma";
import uniform from "@stdlib/random/base/uniform";
import { formatValidationErrors } from "io-ts-reporters";
import { NonZero } from "io-ts-numbers";

type Generator = (
  numberOfSamples: number,
  columns: readonly GeneratedColumn[],
  data: GeneratorData
) => E.Either<string[], ColumnValue[]>;

export function generate(
  numberOfSamples: number,
  columns: readonly GeneratedColumn[],
  data: GeneratorData
): E.Either<string[], { values: ColumnValue[]; type: ColumnType }> {
  return pipe(
    data.columnType,
    E.fromOption(() => ["(internal error) No column type selected"]),
    E.chain((type) => {
      return pipe(
        generatorForType(type)(numberOfSamples, columns, data),
        E.map((values) => {
          return {
            type,
            values,
          };
        })
      );
    })
  );
}

function generatorForType(type: ColumnType) {
  return generators[type];
}

const ageGenerator: Generator = (samples, columns, data) => {
  return maybeCorrelated(
    () =>
      parsedInputsGenerator(AgeRangeCodec.decode, ({ min, max }) =>
        generateNValues(samples, () => age(min.value, max.value))
      )(data.ageRange),
    (column) =>
      parsedCorrelatedGenerator(
        DoBValuesCodec.decode,
        ageFromDoB
      )(column.values)
  )(data.ageRange.correlatesTo);
};

const dobGenerator: Generator = (samples, columns, data) => {
  return maybeCorrelated(
    () =>
      parsedInputsGenerator(AgeRangeCodec.decode, ({ min, max }) =>
        generateNValues(samples, () => dob(min.value, max.value))
      )(data.ageRange),
    (column) =>
      parsedCorrelatedGenerator(
        AgeValuesCodec.decode,
        dobFromAge
      )(column.values)
  )(data.ageRange.correlatesTo);
};

const emailGenerator: Generator = (samples, columns, data) => {
  return maybeCorrelated(
    () =>
      E.right(
        generateNValues(samples, () => email(fakeFirstName(), fakeLastName()))
      ),
    (correlated) =>
      parsedCorrelatedGenerator(
        NameValuesCodec.decode,
        emailFromName
      )(correlated.values)
  )(data.emailCorrelatesTo);
};

const nameGenerator: Generator = (samples, columns, data) => {
  return maybeCorrelated(
    () =>
      E.right(
        generateNValues(samples, () =>
          fullName(enGBFaker.name.firstName(), enGBFaker.name.lastName())
        )
      ),
    (correlated) =>
      parsedCorrelatedGenerator(
        EmailValuesCodec.decode,
        nameFromEmail
      )(correlated.values)
  )(data.nameCorrelatesTo);
};

const addressGenerator: Generator = (samples) => {
  return E.right(
    generateNValues(samples, () =>
      [
        enGBFaker.address.streetAddress(),
        enGBFaker.address.city(),
        enGBFaker.address.zipCode(),
      ].join(", ")
    )
  );
};

const correlatedGenerator: Generator = (samples, columns, data) => {
  return parsedInputsGenerator(CorrelatedCodec.decode, (inputs) => {
    const values = correlated(
      inputs.correlated.correlatesTo.value.values,
      inputs.correlated.gradient.value,
      inputs.correlated.c.value,
      inputs.correlated.loc.value,
      inputs.correlated.standardDeviation.value
    );
    return values.map(rounded(inputs.rounding.type, inputs.rounding.value));
  })(data);
};

const gammaGenerator: Generator = (samples, columns, data) => {
  return parsedInputsGenerator(GammaCodec.decode, (inputs) => {
    const values = generateNValues(samples, () =>
      gamma(inputs.gamma.mean.value, inputs.gamma.standardDeviation.value)
    );

    return values.map(rounded(inputs.rounding.type, inputs.rounding.value));
  })(data);
};

const uniformGenerator: Generator = (samples, columns, data) => {
  return parsedInputsGenerator(UniformCodec.decode, (inputs) => {
    const values = generateNValues(samples, () =>
      uniform(inputs.uniform.min.value, inputs.uniform.max.value)
    );

    return values.map(rounded(inputs.rounding.type, inputs.rounding.value));
  })(data);
};

const normalGenerator: Generator = (samples, columns, data) => {
  return parsedInputsGenerator(NormalCodec.decode, (inputs) => {
    const values = generateNValues(samples, () =>
      normal(inputs.normal.mean.value, inputs.normal.standardDeviation.value)
    );

    return values.map(rounded(inputs.rounding.type, inputs.rounding.value));
  })(data);
};

const generators: { [P in ColumnType]: Generator } = {
  age: ageGenerator,
  email: emailGenerator,
  dob: dobGenerator,
  name: nameGenerator,
  address: addressGenerator,
  correlated: correlatedGenerator,
  gamma: gammaGenerator,
  uniform: uniformGenerator,
  normal: normalGenerator,
};

function gamma(mean: number, standardDeviation: number) {
  const shape = Math.pow(mean / standardDeviation, 2);
  const scale = Math.pow(standardDeviation, 2) / mean;

  return stdGamma(shape, scale);
}

function correlated(
  values: number[],
  gradient: number,
  c: number,
  mean: number,
  standardDeviation: number
) {
  return values.map((val) => {
    return val * gradient + c + normal(mean, standardDeviation);
  });
}

function rounded(type: O.Option<RoundingType>, amount: O.Option<number>) {
  return (value: number) => {
    if (O.isNone(type) || O.isNone(amount)) return value;

    switch (type.value) {
      case "significant":
        return roundSignificant(amount.value, value);
      case "decimal":
        return roundDecimal(amount.value, value);
    }
  };
}

function roundSignificant(amount: number, value: number): string {
  return value.toPrecision(amount);
}

function roundDecimal(amount: number, value: number): string {
  return value.toFixed(amount);
}

const dobFormat = "yyyy-MM-dd";

function dobFromAge(age: number): string {
  const yearLatest = new Date().getFullYear() - age;
  const monthLatest = new Date().getMonth();
  const dayLatest = new Date().getDate();
  const latestDate = new Date(yearLatest, monthLatest, dayLatest);
  const earliestDate = subDays(subYears(latestDate, 1), 1);
  const random = enGBFaker.date.between(earliestDate, latestDate);
  return format(random, dobFormat);
}

function ageFromDoB(dob: string): number {
  const dobAsDate = parse(dob, dobFormat, new Date());
  return differenceInYears(new Date(), dobAsDate);
}

function dob(min: number, max: number) {
  const date = enGBFaker.date.birthdate({
    min,
    max,
    mode: "age",
  });

  return format(date, dobFormat);
}

function age(min: number, max: number) {
  return enGBFaker.datatype.number({
    min,
    max,
  });
}

function email(first: string, last: string) {
  const e = enGBFaker.internet.email(first, last);
  const [, domain] = e.split("@");
  return `${first}.${last}@${domain}`;
}

function fakeFirstName() {
  return enGBFaker.name.firstName();
}

function fakeLastName() {
  return enGBFaker.name.lastName();
}

function fullName(first: string, last: string) {
  return `${first} ${last}`;
}

function emailFromName(name: string): string {
  const [first, last] = name.split(" ");
  return email(first, last);
}

function nameFromEmail(email: string): string {
  const [_fullName] = email.split("@");
  const [first, last] = _fullName.split(".");

  return fullName(first, last);
}

function generateNValues<R>(x: number, generator: () => R) {
  return Array(x).fill(null).map(generator);
}

function parsedInputsGenerator<P, R>(
  parser: (u: unknown) => t.Validation<P>,
  generator: (p: P) => R
) {
  return (inputs: unknown) => {
    return pipe(
      parser(inputs),
      E.map((values) => generator(values)),
      E.mapLeft(validationErrorsToStrings)
    );
  };
}

function parsedCorrelatedGenerator<P, R>(
  parser: (u: unknown[]) => t.Validation<P[]>,
  generator: (p: P) => R
) {
  return (correlatedValues: unknown[]) => {
    return pipe(
      parser(correlatedValues),
      E.map((values) => correlatedToGenerator(values, generator)),
      E.mapLeft(validationErrorsToStrings)
    );
  };
}

function validationErrorsToStrings(errors: t.Errors) {
  return formatValidationErrors(errors);
  // return errors.map((e) => {
  //   console.warn({
  //     e,
  //   });

  //   return formatValidationErrors
  //   // return JSON.stringify(e);
  // });
}

function correlatedToGenerator<T, R>(
  correlatedValues: T[],
  generator: (t: T) => R
) {
  return correlatedValues.map(generator);
}

function maybeCorrelated<R>(
  onNotCorrelated: () => R,
  onCorrelated: (column: GeneratedColumn) => R
) {
  return (correlatedColumn: O.Option<GeneratedColumn>) => {
    if (O.isNone(correlatedColumn)) return onNotCorrelated();

    return onCorrelated(correlatedColumn.value);
  };
}

const EmailValuesCodec = t.array(t.string);
const NameValuesCodec = t.array(t.string);
const DoBValuesCodec = t.array(t.string);
const AgeValuesCodec = t.array(t.number);

const AgeRangeCodec = t.type({
  min: someCodec(t.number),
  max: someCodec(t.number),
});
const RoundingCodec = t.type({
  rounding: t.type({
    type: option(RoundingTypeCodec),
    value: option(t.number),
  }),
});
const CorrelatedCodec = t.intersection([
  t.type({
    correlated: t.type({
      correlatesTo: someCodec(
        t.type({
          values: t.array(t.union([NumberFromString, t.number])),
        })
      ),
      gradient: someCodec(t.number),
      c: someCodec(t.number),
      loc: someCodec(t.number),
      standardDeviation: someCodec(t.number),
    }),
  }),
  RoundingCodec,
]);
const GammaCodec = t.intersection([
  t.type({
    gamma: t.type({
      mean: someCodec(NonZero),
      standardDeviation: someCodec(NonZero),
    }),
  }),
  RoundingCodec,
]);
const UniformCodec = t.intersection([
  t.type({
    uniform: t.type({
      min: someCodec(t.number),
      max: someCodec(t.number),
    }),
  }),
  RoundingCodec,
]);
const NormalCodec = t.intersection([
  t.type({
    normal: t.type({
      mean: someCodec(t.number),
      standardDeviation: someCodec(t.number),
    }),
  }),
  RoundingCodec,
]);

function someCodec<C extends t.Mixed>(codec: C) {
  return t.strict(
    {
      _tag: t.literal("Some"),
      value: codec,
    },
    `Some<${codec.name}>`
  );
}
