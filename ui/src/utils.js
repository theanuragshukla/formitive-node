	export const sleep = (ms) => {
		return new Promise((resolve) => setTimeout(resolve, ms));
	};

	export const getUid = (size=8) => {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		return [...Array(size)].map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
	}
