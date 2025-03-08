import { ofetch } from "ofetch";
/**
 * @link https://github.com/jolpica/jolpica-f1/blob/main/docs/README.md
 */
export const fetchJolpica = ofetch.create({
  baseURL: "https://api.jolpi.ca",
});
