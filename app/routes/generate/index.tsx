import { Link } from "@remix-run/react";

export default function GenerateIndex() {
  return (
    <div className="flex flex-col w-full md:flex-row">
      <div className="card md:w-1/2">
        <div className="card-body items-center text-center">
          <h2 className="card-title">From scratch</h2>
          <p>Do you want to generate data from scratch?</p>
          <div className="card-actions justify-end">
            <Link to="from-scratch" className="btn btn-accent btn-outline">
              Yes, let's generate some data! 🤖
            </Link>
          </div>
        </div>
      </div>
      <div className="divider md:divider-horizontal">OR</div>
      <div className="card md:w-1/2">
        <div className="card-body items-center text-center">
          <h2 className="card-title">From an existing CSV</h2>
          <p>Do you want to add and edit columns for an existing CSV file?</p>
          <div className="card-actions justify-end">
            <Link
              to="from-csv"
              className="btn btn-accent btn-outline indicator"
            >
              Yes, let's edit my CSV file! ✍️
              <span className="indicator-item badge badge-primary">new</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
