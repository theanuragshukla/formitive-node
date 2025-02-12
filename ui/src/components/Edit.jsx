import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import WebViewer from "@pdftron/webviewer";
import { SERVER_URL } from "../constants";
import { useState, useEffect, useRef } from "react";
import { sleep } from "../utils";
import ChatBox from "./common/ChatBox";
import { X, MessageSquare } from "lucide-react";

const Edit = () => {
	const viewer = useRef(null);
	const { uid } = useParams();
	const [instance, setInstance] = useState(null);
	const navigate = useNavigate();
	const [retry, setRetry] = useState(3);
	const [jsonData, setJsonData] = useState({});
	const [loading, setLoading] = useState(true);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const { navRef } = useOutletContext();
	const navHeight = navRef?.current?.clientHeight || 0;

	useEffect(() => {
		if (retry <= 0 || !uid) return;
		const fetchData = async () => {
			await sleep(2000);
			fetch(`${SERVER_URL}/uploads/${uid}.json`)
				.then((res) => res.json())
				.then(async (data) => {
					if (data.status === false) {
						if (
							data.error
								.toString()
								.toLowerCase()
								.contains(
									"failed"
								)
						) {
							alert(
								"Failed to parse the file. Please try again."
							);
							navigate("/");
						} else if (
							data.error
								.lowerCase()
								.contains(
									"progress"
								)
						) {
							await sleep(3000);
						} else {
							alert(
								"Invalid file. Please try again."
							);
							navigate("/");
						}
					} else {
						if (
							JSON.stringify(
								jsonData
							) ===
							JSON.stringify(data)
						)
							return;
						setRetry(0);
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
			})
			.finally(() => setLoading(false));
	}, [jsonData, uid]);

	return (
		<div
			className={`relative flex flex-col md:flex-row ${
				navHeight &&
				`min-h-[calc(100vh - ${navHeight}px)]`
			}`}
		>
			<div className="flex-1 flex relative h-screen overflow-scroll">
				{/*right side*/}
				<div className="flex-1 h-full relative">
					{loading && (
						<div className="absolute inset-0 flex items-center justify-center z-10 bg-white">
							<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
						</div>
					)}
					<div
						ref={viewer}
						className="w-full h-full"
					/>
				</div>
				{/* left side*/}
				<div
					className={`
						fixed md:relative
            inset-0 md:inset-auto
            bg-white
            transition-transform duration-300
            ${
			isDrawerOpen
				? "translate-x-0"
				: "translate-x-full md:translate-x-0"
		}
overflow-hidden
max-h-screen
          `}
				>
					<div className="h-14 border-b flex items-center justify-between px-4 md:px-6 bg-black md:hidden">
						<h2 className="font-medium">
							Chat
						</h2>
						<button
							onClick={() =>
								setIsDrawerOpen(
									false
								)
							}
							className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
					<ChatBox />
				</div>

				<button
					onClick={() => setIsDrawerOpen(true)}
					className={`
            md:hidden
            fixed right-4 bottom-4
            w-12 h-12
            bg-white text-black
            rounded-full
            flex items-center justify-center
            shadow-lg
            z-50
            ${isDrawerOpen ? "hidden" : "flex"}
          `}
				>
					<MessageSquare className="w-6 h-6" />
				</button>

				<div
					onClick={() => setIsDrawerOpen(false)}
					className={`
            fixed inset-0
            bg-black/20
            md:hidden
            transition-opacity duration-300
            ${isDrawerOpen ? "opacity-100 visible" : "opacity-0 invisible"}
            z-40
          `}
				/>
			</div>
		</div>
	);
};

export default Edit;
