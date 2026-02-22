import * as z from "zod";

export const noteIdSchema = z.object({
	id: z.string().uuid("Note ID must be a valid UUID"),
});

export const noteSchema = z.object({
	title: z.string().min(1, "Title is required"),

	content: z.string().min(1, "Content is required"),

	bookId: z.string().uuid("Book ID must be a valid UUID"),

	color: z.hex("Invalid color hex code").optional(),

	pin: z.boolean().optional(),
});

export const noteUpdateSchema = noteSchema.partial().extend({
	id: z.string().uuid("Note ID must be a valid UUID"),
	title: z.string().optional(),
});
