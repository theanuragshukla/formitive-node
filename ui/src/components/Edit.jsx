import { useParams } from "react-router-dom";
import WebViewer from "@pdftron/webviewer";
import { SERVER_URL } from "../constants";
import { useState, useEffect, useRef } from "react";

const Edit = () => {
	const viewer = useRef(null);
	const { uid } = useParams();

	const [jsonData, setJsonData] = useState({});
	const [messages, setMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		fetch(`${SERVER_URL}/uploads/${uid}.json`)
			.then((res) => res.json())
			.then((data) => {
				setJsonData(data);
			})
			.catch((err) => {
				console.error("Error fetching JSON data:", err);
			})
			.finally(() => {
				setLoading(false);
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
								FillColor: new Annotations.Color(100, 149, 237, 0.6),
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

		// Add new message to chat history
		setMessages([...messages, { text: inputMessage, sender: "user" }]);
		setInputMessage("");

		// Here you can add logic to process the message and make changes to the PDF
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					backgroundColor: "#000",
					color: "#fff",
					fontSize: "1.5rem",
				}}
			>
				Loading...
			</div>
		);
	}

	return (
		<div style={{ display: "flex", height: "100vh" }}>
			<div className="webviewer" ref={viewer} style={{ flex: 1 }}></div>
			<div
				style={{
					width: "330px",
					backgroundColor: "#000000",
					padding: "10px",
					boxSizing: "border-box",
					display: "flex",
					flexDirection: "column",
					height: "100%",
				}}
			>
				<h2 className="underline m-2 font-bold mx-2 text-white">Chat</h2>

				{/* Chat history */}
				<div
					style={{
						flex: 1,
						overflowY: "auto",
						marginBottom: "10px",
						backgroundColor: "#121212",
						borderRadius: "5px",
						padding: "10px",
					}}
				>
					{messages.map((message, index) => (
						<div
							key={index}
							style={{
								marginBottom: "10px",
								padding: "8px",
								backgroundColor:
									message.sender === "user" ? "#252525" : "#121212",
								borderRadius: "5px",
								maxWidth: "85%",
								marginLeft: message.sender === "user" ? "auto" : "0",
								color: "white",
							}}
						>
							{message.text}
						</div>
					))}
				</div>

				{/* Message input form */}
				<form
					onSubmit={handleSubmit}
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "8px",
					}}
				>
					<textarea
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type your message..."
						style={{
							height: "100px",
							padding: "8px",
							borderRadius: "5px",
							resize: "none",
							fontFamily: "inherit",
							backgroundColor: "#252525",
							color: "white",
						}}
					/>
					<button
						type="submit"
						style={{
							padding: "8px 16px",
							backgroundColor: "#252525",
							color: "white",
							border: "none",
							borderRadius: "5px",
							cursor: "pointer",
						}}
					>
						Send
					</button>
				</form>
			</div>
		</div>
	);
};

export default Edit;
