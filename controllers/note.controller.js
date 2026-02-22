import { prisma } from "../config/prisma.js";
import { bookIdSchema } from "../validation/book.validate.js";
import {
	noteIdSchema,
	noteSchema,
	noteUpdateSchema,
} from "../validation/note.validate.js";

/* ---------------- GET ALL NOTES ---------------- */
export const getNotes = async (req, res) => {
	try {
		const { userId } = await req.auth();

		const notes = await prisma.note.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});

		return res.status(200).json(notes);
	} catch {
		return res.status(500).json({ error: "Failed to fetch notes" });
	}
};

/* ---------------- GET NOTES BY BOOK ID ---------------- */
export const getNotesByBookId = async (req, res) => {
	try {
		const { userId } = await req.auth();

		const validate = bookIdSchema.safeParse(req.params);
		if (!validate.success) {
			return res.status(400).json({
				error: validate.error.flatten(),
			});
		}

		const { id: bookId } = validate.data;

		const notes = await prisma.note.findMany({
			where: { userId, bookId },
			orderBy: { createdAt: "desc" },
		});

		return res.status(200).json(notes);
	} catch {
		return res.status(500).json({ error: "Failed to fetch notes" });
	}
};

/* ---------------- CREATE NOTE ---------------- */
export const createNote = async (req, res) => {
	try {
		const { userId } = await req.auth();
		const validate = noteSchema.safeParse(req.body);

		if (!validate.success) {
			return res.status(400).json({
				error: validate.error.flatten(),
			});
		}

		const { bookId, ...data } = validate.data;

		const book = await prisma.book.findFirst({
			where: { id:bookId, userId },
		});

		if (!book) {
			return res.status(404).json({ error: "Book not found" });
		}

		const note = await prisma.note.create({
			data: {
				...data,
				bookId,
				userId,
			},
		});

		return res.status(201).json(note);
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Failed to create note" });
	}
};

/* ---------------- UPDATE NOTE ---------------- */
export const updateNote = async (req, res) => {
	try {
		const { userId } = await req.auth();

		const paramValidate = noteIdSchema.safeParse(req.params);
		if (!paramValidate.success) {
			return res.status(400).json({
				error: paramValidate.error.flatten(),
			});
		}

		const bodyValidate = noteUpdateSchema.safeParse(req.body);
		if (!bodyValidate.success) {
			return res.status(400).json({
				error: bodyValidate.error.flatten(),
			});
		}

		const { id } = paramValidate.data;
		const data = bodyValidate.data;

		const note = await prisma.note.findFirst({
			where: { id, userId },
		});

		if (!note) {
			return res.status(404).json({ error: "Note not found" });
		}

		const updatedNote = await prisma.note.update({
			where: { id },
			data,
		});

		return res.status(200).json(updatedNote);
	} catch {
		return res.status(500).json({ error: "Failed to update note" });
	}
};

/* ---------------- DELETE NOTE ---------------- */
export const deleteNote = async (req, res) => {
	try {
		const { userId } = await req.auth();

		const validate = noteIdSchema.safeParse(req.params);
		if (!validate.success) {
			return res.status(400).json({
				error: validate.error.flatten(),
			});
		}

		const { id } = validate.data;

		const note = await prisma.note.findFirst({
			where: { id, userId },
		});

		if (!note) {
			return res.status(404).json({ error: "Note not found" });
		}

		await prisma.note.delete({
			where: { id },
		});

		return res.status(200).json({
			message: "Note deleted successfully",
		});
	} catch {
		return res.status(500).json({ error: "Failed to delete note" });
	}
};
