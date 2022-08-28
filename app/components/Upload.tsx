import type { HTMLProps, ReactNode } from "react";

type Props = {
  label: ReactNode;
} & HTMLProps<HTMLInputElement>;

export function Upload(props: Props) {
  const { label, ...rest } = props;

  const id = rest.id ?? "file";

  return (
    <div className="form-control">
      <label htmlFor={id} className="label justify-center">
        <span className="label-text text-center">{label}</span>
      </label>
      <input
        id={id}
        type="file"
        accept=".csv"
        className="input"
        required
        {...rest}
      />
    </div>
  );
}
