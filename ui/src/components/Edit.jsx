import { useParams } from "react-router-dom";
import WebViewer from "@pdftron/webviewer";
import { SERVER_URL } from "../constants";
import { useEffect, useRef } from "react";

const Edit = () => {
	const viewer = useRef(null);
	const { uid } = useParams();

	useEffect(() => {
		WebViewer(
			{
				path: "/webviewer/lib/public",
				licenseKey:
					"demo:1735303205907:7ebdf3980300000000e788eac0142d16cb4916c25b6280dcd31d0e975c",
				initialDoc: `${SERVER_URL}/uploads/${uid}_out.pdf`,
			},
			viewer.current
		);
	}, []);

	return (
		<div className="MyComponent">
			<div className="webviewer" ref={viewer} style={{ height: "100vh" }}></div>
		</div>
	);
};

export default Edit;
