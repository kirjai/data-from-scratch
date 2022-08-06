import type { GeneratorData } from "~/components/GeneratorContext";
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

const generators: { [P in ColumnType]: Generator } = {
  age: ageGenerator,
  email: emailGenerator,
  dob: dobGenerator,
  name: nameGenerator,
  address: addressGenerator,
};

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
      E.map((values) => correlatedGenerator(values, generator)),
      E.mapLeft(validationErrorsToStrings)
    );
  };
}

function validationErrorsToStrings(errors: t.Errors) {
  return errors.map((e) => JSON.stringify(e));
}

function correlatedGenerator<T, R>(
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

function someCodec<C extends t.Mixed>(codec: C) {
  return t.strict(
    {
      _tag: t.literal("Some"),
      value: codec,
    },
    `Some<${codec.name}>`
  );
}
