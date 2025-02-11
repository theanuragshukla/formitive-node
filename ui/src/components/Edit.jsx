import { useNavigate, useParams } from "react-router-dom";
import WebViewer from "@pdftron/webviewer";
import { SERVER_URL } from "../constants";
import { useState, useEffect, useRef } from "react";

const Edit = () => {
	const viewer = useRef(null);
	const { uid } = useParams();
	const [loading, setLoading] = useState(true);
	const [instance, setInstance] = useState(null);
	const navigate = useNavigate()

	const sleep = (ms) => {
		return new Promise((resolve) => setTimeout(resolve, ms));
	};

	const [jsonData, setJsonData] = useState({});

	const [retry, setRetry] = useState(3);

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
							navigate('/')
						} else if (data.error.lowerCase().contains("progress")) {
							await sleep(3000);
						} else {
							alert("Invalid file. Please try again.");
							navigate('/')
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
			alert("We couldn’t find any places to add fields. You can manually add any fields and edit the PDF as needed!");
			navigate('/')
			return;
		}
		WebViewer(
			{
				path: "/webviewer/lib/public",
				initialDoc: `${SERVER_URL}/uploads/${uid}_out.pdf`,
			},
			viewer.current
		).then((instance) => {
			setInstance(instance);
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
								StrokeColor: new Annotations.Color(0, 0, 0, 0),
								FillColor: new Annotations.Color(100, 149, 237, 0.1),
							});
							return anno;
						})()
					);
				});
			});
		});
	}, [jsonData, uid]);

	return (
		<>
			{loading && (
				<div
					class="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
					role="status"
					aria-label="loading"
				>
					<span class="sr-only">Loading...</span>
				</div>
			)}
			<div className="webviewer" ref={viewer} style={{ height: "100vh" }}></div>
		</>
	);
};

export default Edit;
