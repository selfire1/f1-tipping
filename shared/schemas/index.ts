import { z } from "zod";

export const createGroup = z.object({
  name: z.string().min(1, "Required"),
});
