import type { ActionFunction } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { unstable_composeUploadHandlers } from "@remix-run/node";
import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import * as tn from "io-ts-numbers";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { encodeCSV, parse } from "~/utils/upload.server";
import { TextDecoder } from "text-encoding";

const formValues = t.type({
  file: t.string,
  samples: tn.PositiveFromString,
});

export const action: ActionFunction = async ({ request }) => {
  const uploadHandler = unstable_composeUploadHandlers(async (part) => {
    if (part.contentType !== "text/csv") return;

    let data = "";
    for await (const x of part.data) {
      data += new TextDecoder().decode(x);
    }

    return data;
  }, unstable_createMemoryUploadHandler());

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const result = await pipe(
    formData,
    (fd) => {
      return {
        file: fd.get("file"),
        samples: fd.get("samples"),
      };
    },
    formValues.decode,
    TE.fromEither,
    TE.chain((values) => {
      return pipe(
        E.tryCatch(
          () => parse(values.file),
          (e) => {
            console.error("Could not parse CSV", e);
          }
        ),
        TE.fromEither,
        TE.chain((parsed) => {
          return pipe(
            TE.tryCatch(
              () => {
                return fetch(
                  "http://syntheticdata.pythonanywhere.com/increase",
                  {
                    method: "POST",
                    body: JSON.stringify({
                      columns: parsed.slice(1),
                      addSamples: values.samples,
                    }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );
              },
              (error) => {
                console.error("ERROR FROM EXTERNAL API", {
                  error,
                });
                return error as any;
              }
            ),
            TE.chain((response) =>
              TE.tryCatch(
                async () => {
                  return response.json();
                },
                (e) => {
                  console.log("ERROR parsing JSON from external API", {
                    e,
                  });
                  return e as any;
                }
              )
            ),
            TE.map((response) => response.response),
            TE.map((newRows) => [...parsed, ...newRows]),
            TE.map(encodeCSV)
          );
        })
      );
    })
  )();

  if (E.isLeft(result)) {
    console.error("Error", result.left);
    return json({
      error: result.left,
    });
  }

  return new Response(result.right, {
    headers: {
      "Content-Type": "text/csv",
    },
  });
};
