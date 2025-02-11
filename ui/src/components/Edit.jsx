import { useNavigate, useParams } from "react-router-dom";
import WebViewer from "@pdftron/webviewer";
import { SERVER_URL } from "../constants";
import { useState, useEffect, useRef } from "react";
import Nav from "./Nav";

const Edit = () => {
	const viewer = useRef(null);
	const { uid } = useParams();
	const [instance, setInstance] = useState(null);
	const navigate = useNavigate();
	const [retry, setRetry] = useState(3);
	const [jsonData, setJsonData] = useState({});
	const [messages, setMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState("");
	const [loading, setLoading] = useState(true);
	const [showExitPrompt, setShowExitPrompt] = useState(false);
	const hasUnsavedData = true;

	const sleep = (ms) => {
		return new Promise((resolve) => setTimeout(resolve, ms));
	};

	useEffect(() => {
		if (retry === 0 || !uid) return;
		const fetchData = async () => {
			await sleep(2000);
			fetch(`${SERVER_URL}/uploads/${uid}.json`)
				.then((res) => res.json())
				.then(async (data) => {
					if (data.status === false) {
						if (data.error.lowerCase().contains("failed")) {
							alert("Failed to parse the file. Please try again.");
							navigate("/");
						} else if (data.error.lowerCase().contains("progress")) {
							await sleep(3000);
						} else {
							alert("Invalid file. Please try again.");
							navigate("/");
						}
					} else {
						setJsonData(data);
					}
				})
				.catch((err) => {
					console.log(err);
				});
			setRetry((prev) => prev - 1);
		};
		fetchData();
	}, [uid, retry]);

	useEffect(() => {
		if (!jsonData.pages || !!instance) return;
		setLoading(false);
		if (jsonData.pages[0].formElements.length === 0) {
			alert(
				"We couldn’t find any places to add fields. You can manually add any fields and edit the PDF as needed!"
			);
			navigate("/");
			return;
		}
		WebViewer(
			{
				path: "/webviewer/lib/public",
				initialDoc: `${SERVER_URL}/uploads/${uid}_out.pdf`,
			},
			viewer.current
		)
			.then((instance) => {
				setInstance(instance);
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
			})
			.finally(() => setLoading(false));
	}, [jsonData, uid]);

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
		<div className="w-screen h-screen max-w-screen flex flex-col overflow-hidden">
			<Nav />
			<div className="flex flex-1 flex-col md:flex-row overflow-hidden">
				<div className="order-1 md:order-2 w-full md:w-[330px] bg-black p-2 md:p-4 flex flex-col h-full relative border-l border-[#333333]">
					<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xl font-bold">
						Coming Soon
					</div>
					<h2 className="text-sm md:text-base underline mb-1 md:mb-2 font-bold text-white">
						Chat
					</h2>
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
				<div className="order-2 md:order-1 flex-1 h-full relative">
					{loading && (
						<div className="absolute inset-0 flex items-center justify-center z-10 bg-[#121212] bg-opacity-50">
							<div className="w-8 h-8 border-4 border-grey-500 border-t-transparent border-solid rounded-full animate-spin" />
						</div>
					)}
					<div ref={viewer} className="w-full h-full" />
				</div>
			</div>
		</div>
	);
};

export default Edit;
