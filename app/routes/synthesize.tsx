import { useFetcher } from "@remix-run/react";

export default function Synthesize() {
  const fetcher = useFetcher();

  const loading = fetcher.state === "submitting" || fetcher.state === "loading";

  console.log({
    state: fetcher.state,
  });

  return (
    <div className="max-w-screen-xl	px-10">
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
          <div className="form-control">
            <label className="label" htmlFor="file">
              <span>Which .CSV file do you want to synthesize data for?</span>
            </label>
            <input
              id="file"
              type="file"
              accept=".csv"
              name="file"
              className="input"
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="samples" className="label">
              Number of rows to synthesize
            </label>
            <input
              className="input input-lg invalid:input-bordered invalid:input-error"
              type="number"
              name="samples"
              id="samples"
              required
              min={1}
              defaultValue={100}
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${loading ? "loading" : ""}`}
          >
            {loading ? "Synthesizing..." : "Synthesize! 🚀"}
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}
