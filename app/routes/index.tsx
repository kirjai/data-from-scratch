// @ts-expect-error
import { useClippy } from "@react95/clippy";
import { useEffect } from "react";
import { Table } from "~/components/Table";

export default function Index() {
  const { clippy } = useClippy();
  const isFirstColumn = true;

  useEffect(() => {
    if (clippy) {
      console.log(clippy.animations());
    }
  }, [clippy]);

  useEffect(() => {
    if (clippy) {
      clippy?.play("Greeting");
    }
  }, [clippy]);

  return (
    <>
      <div className="flex justify-center">
        <div className="pt-10">
          <h1 className="font-bold text-4xl pb-4">Data from scratch</h1>
          <h2>Let's generate some data! ⚙️</h2>

          <div className="mt-10">
            {isFirstColumn ? (
              <div className="mb-4">
                <p className="text-xl font-medium mb-1">
                  ⬇️ This is your first column ⬇️
                </p>
                <p className="text-sm opacity-60">
                  Click the header to edit ✏️
                </p>
              </div>
            ) : null}

            <Table />
          </div>
        </div>
      </div>
    </>
  );
}
