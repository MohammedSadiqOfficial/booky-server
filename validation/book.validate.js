import * as z from "zod";

// TODO:Create validate Schema for Update because title is needed
export const bookIdSchema = z.object({
	id: z.string().uuid("Note ID must be a valid UUID"),
});

export const bookSchema = z.object({
	id: z.string().uuid("Book ID must be a valid UUID").optional(),

	title: z.string().min(1, "Title is required"),

	author: z.string().min(1, "Author is required").optional(),

	publishedYear: z
		.int()
		.min(0, "Published year must be a positive integer")
		.optional(),

	coverImage: z.string().url("Cover image must be a valid URL").optional(),

	status: z.enum(["TO_READ", "READING", "COMPLETED"]).optional(),

	readPages: z
		.number()
		.min(0, "Read pages must be a non-negative number")
		.optional(),

	totalPages: z.number().min(1, "Total pages must be at least 1").optional(),
});
