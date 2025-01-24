import { useParams } from "react-router-dom";
import WebViewer from "@pdftron/webviewer";
import { SERVER_URL } from "../constants";
import { useState, useEffect, useRef } from "react";
import Nav from "./Nav";

const Edit = () => {
	const viewer = useRef(null);
	const { uid } = useParams();

	const [jsonData, setJsonData] = useState({});
	const [messages, setMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState("");

	useEffect(() => {
		fetch(`${SERVER_URL}/uploads/${uid}.json`)
			.then((res) => res.json())
			.then((data) => {
				setJsonData(data);
			})
			.catch((err) => {
				console.error("Error fetching JSON data:", err);
			});
	}, [uid]);

	useEffect(() => {
		if (!jsonData.pages) return;
		WebViewer(
			{
				path: "/webviewer/lib/public",
				initialDoc: `${SERVER_URL}/uploads/${uid}_out.pdf`,
			},
			viewer.current
		).then((instance) => {
			const theme = instance.UI.Theme;
			instance.UI.setTheme(theme.DARK);
			const { annotationManager, Annotations } = instance.Core;
			jsonData.pages.forEach((page) => {
				page.formElements.forEach((element) => {
					annotationManager.addAnnotation(
						(() => {
							const anno = new Annotations.RectangleAnnotation({
								PageNumber: page.properties.pageNumber,
								X: element.rect[0],
								Y: element.rect[1],
								Width: element.rect[2] - element.rect[0],
								Height: element.rect[3] - element.rect[1],
								StrokeColor: new Annotations.Color(0, 0, 0, 1),
								FillColor: new Annotations.Color(234, 236, 248, 0.6),
							});
							return anno;
						})()
					);
				});
			});
		});
	}, [jsonData, uid]);

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
		<div className="w-screen h-screen max-w-screen flex flex-col overflow-hidden">
			<Nav />
			{/* Wrap content in a flex-1 container so Nav stays at top */}
			<div className="flex flex-1 flex-col md:flex-row overflow-hidden">
				{/* Chat Section */}
				<div className="order-1 md:order-2 w-full md:w-[330px] bg-black p-2 md:p-4 flex flex-col h-full relative border-l border-[#333333]">
					{/* Coming Soon Overlay */}
					<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xl font-bold">
						Coming Soon
					</div>
					{/* Title */}
					<h2 className="text-sm md:text-base underline mb-1 md:mb-2 font-bold text-white">
						Chat
					</h2>

					{/* Chat Messages */}
					<div className="flex-1 overflow-y-auto bg-[#121212] rounded p-1 md:p-2 mb-1 md:mb-2">
						{messages.map((message, index) => (
							<div
								key={index}
								className={`mb-1 p-1 md:p-2 rounded max-w-[85%] text-sm md:text-base text-white ${
									message.sender === "user" ? "bg-[#252525] ml-auto" : "bg-[#121212] ml-0"
								}`}
							>
								{message.text}
							</div>
						))}
					</div>

					{/* Input Form */}
					<form onSubmit={handleSubmit} className="flex flex-col gap-1 md:gap-2">
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

				{/* PDF Viewer */}
				<div className="order-2 md:order-1 flex-1 h-full" ref={viewer} />
			</div>
		</div>
	);
};

export default Edit;
