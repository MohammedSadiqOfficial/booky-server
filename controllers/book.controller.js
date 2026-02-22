import { prisma } from "../config/prisma.js";
import { formatZodError } from "../config/zodFormat.js";
import { bookIdSchema, bookSchema } from "../validation/book.validate.js";

/* ---------------- GET ALL BOOKS ---------------- */
export const getBooks = async (req, res) => {
	try {
		const { userId } = await req.auth();

		const books = await prisma.book.findMany({
			where: {
				user: {
					clerkId: userId,
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return res.status(200).json(books);
	} catch (error) {
		console.log(error);
		console.log(error?.message);
		return res.status(500).json({ error: "Failed to fetch books" });
	}
};

/* ---------------- GET BOOK BY ID ---------------- */
export const getBookById = async (req, res) => {
	try {
		const { userId } = await req.auth();
		const validate = bookIdSchema.safeParse(req.params);
		if (!validate.success) {
			return res.status(400).json({
				error: formatZodError(validate.error),
			});
		}

		const { id } = validate.data;

		const book = await prisma.book.findFirst({
			where: {
				id,
				user: {
					clerkId: userId,
				},
			},
		});

		if (!book) {
			return res.status(404).json({ message: "Not found" });
		}

		return res.status(200).json(book);
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Failed to fetch book" });
	}
};

/* ---------------- CREATE BOOK ---------------- */
export const createBook = async (req, res) => {
	try {
		const { userId } = await req.auth();

		const validate = await bookSchema.safeParseAsync(req.body);
		if (!validate.success) {
			return res.status(400).json({
				error: formatZodError(validate.error),
			});
		}

		const createdBook = await prisma.book.create({
			data: {
				...validate.data,
				user: {
					connect: {
						clerkId: userId,
					},
				},
			},
		});

		return res.status(201).json({
			data: createdBook,
			message: "Book created successfully",
		});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: error.message || "Failed to create book" });
	}
};

/* ---------------- UPDATE BOOK ---------------- */
export const updateBook = async (req, res) => {
	try {
		const { userId } = await req.auth();
		const validate = await bookSchema.safeParseAsync(req.body);
		console.log(validate.data);
		if (!validate.success) {
			return res.status(400).json({
				error: formatZodError(validate.error),
			});
		}

		const { id, ...data } = validate.data;

		if (!id) {
			return res.status(400).json({ message: "Id is required" });
		}

		const book = await prisma.book.findFirst({
			where: {
				id,
				user: {
					clerkId: userId,
				},
			},
		});

		if (!book) {
			return res.status(404).json({ message: "Not found" });
		}

		const updatedBook = await prisma.book.update({
			where: { id },
			data,
		});

		return res.status(200).json({
			data: updatedBook,
			message: "Book updated successfully",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Failed to update book" });
	}
};

/* ---------------- DELETE BOOK(S) ---------------- */
export const deleteBook = async (req, res) => {
	try {
		const { userId } = await req.auth();
		const { ids } = req.body;

		if (!Array.isArray(ids) || ids.length === 0) {
			return res.status(400).json({ message: "Ids array required" });
		}

		const result = await prisma.book.deleteMany({
			where: {
				user: {
					clerkId: userId,
				},
				id: { in: ids },
			},
		});

		if (result.count === 0) {
			return res.status(404).json({ message: "Not found" });
		}

		return res.status(200).json({
			count: result.count,
			message: "Deleted book(s) successfully",
		});
	} catch (error) {
		return res.status(500).json({ error: "Failed to delete book" });
	}
};
