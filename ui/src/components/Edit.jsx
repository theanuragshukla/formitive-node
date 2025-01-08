import { useParams } from "react-router-dom";
import WebViewer from "@pdftron/webviewer";
import { SERVER_URL } from "../constants";
import { useState, useEffect, useRef } from "react";

const Edit = () => {
	const viewer = useRef(null);
	const { uid } = useParams();

	const [jsonData, setJsonData] = useState({});

	useEffect(() => {
		fetch(`${SERVER_URL}/uploads/${uid}.json`).then((res) => {
			res.json().then((data) => {
				setJsonData(data);
			});
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
									FillColor: new Annotations.Color(100,149,237, 0.1),
								});
								return anno;
							})()
						);
				});
			});
		});
	}, [jsonData, uid]);

	return (
			<div className="webviewer" ref={viewer} style={{ height: "100vh" }}></div>
	);
};

export default Edit;
