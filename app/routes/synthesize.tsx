import { useFetcher } from "@remix-run/react";
import { Header } from "~/components/Header";
import { Upload } from "~/components/Upload";

export default function Synthesize() {
  const fetcher = useFetcher();

  const loading = fetcher.state === "submitting" || fetcher.state === "loading";

  console.log({
    state: fetcher.state,
  });

  return (
    <div className="max-w-screen-xl	px-10">
      <Header />

      <div className="pt-10">
        <h1 className="font-bold text-4xl pb-4 text-center">Synthetic data</h1>
      </div>

      <div className="flex justify-center">
        <fetcher.Form
          encType="multipart/form-data"
          action="/synthesized-csv"
          method="post"
          reloadDocument
          className="flex flex-col justify-center mt-10 gap-10"
        >
          <Upload
            label="Which .CSV file do you want to synthesize data for?"
            name="file"
          />

          <div className="form-control">
            <label htmlFor="samples" className="label justify-center">
              <span className="label-text">Number of rows to synthesize</span>
            </label>
            <div className="justify-center flex">
              <input
                className="input input-bordered input-lg invalid:input-bordered invalid:input-error w-32"
                type="number"
                name="samples"
                id="samples"
                required
                min={1}
                defaultValue={100}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-accent ${loading ? "loading" : ""}`}
          >
            {loading ? "Synthesizing..." : "Synthesize! 🚀"}
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}
