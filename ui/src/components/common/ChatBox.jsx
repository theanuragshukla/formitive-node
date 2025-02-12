import { useEffect, useState } from "react";

export default function ChatBox(){

	const [messages, setMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState("");
	const [showExitPrompt, setShowExitPrompt] = useState(false);
	const hasUnsavedData = true;


	useEffect(() => {
		const handleBeforeUnload = (e) => {
			if (hasUnsavedData) {
				e.preventDefault();
				e.returnValue = "";
				setShowExitPrompt(true);
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [hasUnsavedData]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!inputMessage.trim()) return;

		setMessages([...messages, { text: inputMessage, sender: "user" }]);
		setInputMessage("");
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};
	return (
				<div className=" md:order-2 w-full md:w-[330px] bg-black p-2 md:p-4 flex flex-col h-full relative border-l border-[#333333]">
			<h2>Chat</h2>
					<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xl font-bold">
						Coming Soon
					</div>
					<div className="flex-1 overflow-y-auto bg-[#121212] rounded p-1 md:p-2 mb-1 md:mb-2">
						{messages.map((message, index) => (
							<div
								key={index}
								className={`mb-1 p-1 md:p-2 rounded max-w-[85%] text-sm md:text-base text-white ${
									message.sender === "user"
										? "bg-[#252525] ml-auto"
										: "bg-[#121212] ml-0"
								}`}
							>
								{message.text}
							</div>
						))}
					</div>
					<form
						onSubmit={handleSubmit}
						className="flex flex-col gap-1 md:gap-2"
					>
						<textarea
							value={inputMessage}
							onChange={(e) => setInputMessage(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Type your message..."
							className="h-16 md:h-24 p-2 text-sm md:text-base bg-[#252525] text-white rounded resize-none"
						/>
						<button
							type="submit"
							className="py-1 md:py-2 bg-[#252525] text-white rounded cursor-pointer text-sm md:text-base"
						>
							Send
						</button>
					</form>
				</div>
	)
}
