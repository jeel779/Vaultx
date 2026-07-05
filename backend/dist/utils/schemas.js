import { z } from "zod";
export const userSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    adminSecret: z.string().optional(),
});
export const loginSchema = z.object({
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});
export const profileUpdateSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long").optional(),
    email: z.string().trim().email("Invalid email address").optional(),
});
export const listingSchema = z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters long"),
    description: z.string().trim().min(10, "Description must be at least 10 characters long"),
    price: z.preprocess((val) => Number(val), z.number().min(0, "Price must be a positive number")),
    category: z.enum(["Gaming", "Social Media", "Other"]),
    platform: z.string().trim().min(1, "Platform is required"),
    accountLevel: z.string().trim().min(1, "Account level is required"),
    country: z.string().trim().min(1, "Country is required"),
});
export const messageSchema = z.object({
    content: z.string().trim().min(1, "Message content cannot be empty"),
    receiverId: z.string().uuid("Invalid receiver ID"),
    listingId: z.string().uuid("Invalid listing ID"),
});
//# sourceMappingURL=schemas.js.map