import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(72)
    .refine(
      (value) => /[a-zA-Z]/.test(value) && /[0-9]/.test(value),
      "Password must contain at least one letter and one number"
    ),
});
