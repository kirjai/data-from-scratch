import { Link } from "@remix-run/react";

export function Header() {
  return (
    <div className="flex gap-10 mt-8">
      <Link to="/" className="link">
        Generate
      </Link>

      <Link to="/synthesize" className="link">
        Synthesize
      </Link>
    </div>
  );
}
