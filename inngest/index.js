import { Inngest } from "inngest";
import { prisma } from "../config/prisma.js";

export const inngest = new Inngest({ id: "booky" });

// CREATE USER
const syncUserCreation = inngest.createFunction(
	{ id: "sync-user-from-clerk" },
	{ event: "clerk/user.created" },
	async ({ event }) => {
		const { data } = event;

		await prisma.user.create({
			data: {
				clerkId: data.id,
				email: data.email_addresses?.[0]?.email_address || "",
				name: `${data.first_name || ""} ${data.last_name || ""}`,
				image: data.image_url || "",
			},
		});
	},
);

// DELETE USER
const syncUserDeletion = inngest.createFunction(
	{ id: "delete-user-with-clerk" },
	{ event: "clerk/user.deleted" },
	async ({ event }) => {
		const { data } = event;

		await prisma.user.delete({
			where: {
				clerkId: data.id,
			},
		});
	},
);

// UPDATE USER
const syncUserUpdation = inngest.createFunction(
	{ id: "update-user-with-clerk" },
	{ event: "clerk/user.updated" },
	async ({ event }) => {
		const { data } = event;

		await prisma.user.update({
			where: {
				clerkId: data.id,
			},
			data: {
				email: data.email_addresses?.[0]?.email_address || "",
				name: `${data.first_name || ""} ${data.last_name || ""}`,
				image: data.image_url || "",
			},
		});
	},
);

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];
