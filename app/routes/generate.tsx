// import { useClippy } from "@react95/clippy";
// import { useEffect } from "react";
import { Header } from "~/components/Header";
import { Outlet } from "@remix-run/react";

export default function Index() {
  return (
    // <ClippyProvider>
    <div className="max-w-screen-xl	px-10">
      <Header />

      <div className="pt-10">
        <h1 className="font-bold text-4xl pb-4 text-center">Generate data</h1>

        <div className="flex justify-center w-full mt-10">
          <div className="flex flex-col gap-10 w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
    // <Clippy />
    // </ClippyProvider>
  );
}

// function Clippy() {
//   const { clippy } = useClippy();

//   useEffect(() => {
//     if (clippy) {
//       console.log(clippy.animations());
//     }
//   }, [clippy]);

//   useEffect(() => {
//     if (clippy) {
//       clippy?.play("Greeting");
//     }
//   }, [clippy]);

//   return null;
// }
