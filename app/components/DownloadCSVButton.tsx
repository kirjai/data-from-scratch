import type { ComponentProps } from "react";
import { CSVLink } from "react-csv";

type Props = {
  csv: ComponentProps<typeof CSVLink>["data"];
};

export function DownloadCSVButton(props: Props) {
  return (
    <div className="text-center flex flex-col gap-4">
      <p>Ready to save the generated data as a CSV?</p>
      <div>
        <CSVLink
          data={props.csv}
          target="_blank"
          className="btn btn-accent"
          filename="data-from-scratch.csv"
        >
          Download CSV
        </CSVLink>
      </div>
    </div>
  );
}
