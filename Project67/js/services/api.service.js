import { wait } from "../utils/helpers.js";

/* 
  This file simulates network requests so the UI feels real now,
  and can later be swapped with fetch() calls to PHP endpoints.
*/
export async function fakeRequest(payload, delay = 320) {
  await wait(delay);
  return payload;
}
