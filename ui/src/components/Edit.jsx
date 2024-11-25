import React, { useEffect, useRef, useState } from "react";
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
	const [isRendered, setIsRendered] = useState(false);
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

	const canvas = useRef();
	const ctx = canvas.current?.getContext("2d");

	useEffect(() => {
		if (!data?.meta || !ctx) return;
		const { width, height } = data.meta;
		if (width && height) {
			canvas.height = height;
			canvas.width = width;
		}
		data.fields[0].forEach((field) => {
			const [ x, y, w, h ] = field;
			ctx.strokeStyle = "red";
			ctx.lineWidth = 2;
			ctx.strokeRect(x, y, w, h);
		});
	}, [data, canvas, ctx]);

	function onRenderSuccess() {
		setIsRendered(true);
	}

	return (
		<div className="border-2 border-red-500">
			{!!data && (
				<>
					<Document
						file={`${SERVER_URL}/uploads/${uid}`}
						onLoadSuccess={onRenderSuccess}
						renderMode="canvas"
					>
						{new Array(data.meta?.pages).fill(0).map((_, i) => (
							<Page
								pageNumber={i + 1}
								width={canvas.width}
								height={canvas.height}
								renderTextLayer={false}
								key={i}
							/>
						))}
					</Document>
					{}
				</>
			)}
		</div>
	);
}
