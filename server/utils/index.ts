import { ofetch } from "ofetch";
/**
 * @link https://github.com/jolpica/jolpica-f1/blob/main/docs/README.md
 */
export const fetchErgast = ofetch.create({
  baseURL: "https://api.jolpi.ca",
});
