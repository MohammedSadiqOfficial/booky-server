export const formatZodError = (zodError) => {
	const firstError = zodError.issues[0];
	return firstError.message;
};
