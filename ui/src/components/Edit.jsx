import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { pdfjs, Document, Page } from "react-pdf";
import "../styles/pdf_canvas.css";
import { SERVER_URL } from "../constants";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.mjs",
	import.meta.url
).toString();

export default function Edit() {
	const { uid } = useParams();
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState(null);

	useEffect(() => {
		fetch(`${SERVER_URL}/get-output/${uid}`)
			.then((res) => res.json())
			.then((data) => {
				const { status, data: outputData, error } = data;
				if (status) {
					setData(outputData);
				} else {
					console.error(error);
				}
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setLoading(false);
			});
	}, [uid]);

	useEffect(() => {
		if (!data?.meta) {
			return;
		}
	}, [data]);

	return (
		<div>
			{!!data && (
				<>
					{new Array(data.meta.pages).fill(0).map((_, i) => (
						<div key={i} className={`border-2 border-blue-500 relative`}>
							<img
								src={`${SERVER_URL}/uploads/${uid}_page_${i}.jpg`}
								width={data.meta.width}
								height={data.meta.height}
							/>
							{data.fields[i].map((field, index) => (
								<div
									key={index}
									className="absolute border-4 border-green-500"
									style={{
										top: field[0],
										left: field[1],
										width : field[2],
										height : field[3]
									}}
								>
									{field.name}
								</div>
							))}
						</div>
					))}
				</>
			)}
		</div>
	);
}
