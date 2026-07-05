import { z } from "zod";
export declare const userSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    adminSecret: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const profileUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const listingSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    price: z.ZodPreprocess<z.ZodNumber>;
    category: z.ZodEnum<{
        Gaming: "Gaming";
        "Social Media": "Social Media";
        Other: "Other";
    }>;
    platform: z.ZodString;
    accountLevel: z.ZodString;
    country: z.ZodString;
}, z.core.$strip>;
export declare const messageSchema: z.ZodObject<{
    content: z.ZodString;
    receiverId: z.ZodString;
    listingId: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=schemas.d.ts.map