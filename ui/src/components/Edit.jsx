import jsPDF from "jspdf";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SERVER_URL } from "../constants";

export default function Edit() {
	const { uid } = useParams();
	const [data, setData] = useState(null);
	const [values, setValues] = useState([]);

	const handleChange = (e) => {
		const [page, index] = e.target.id.split("-").slice(1);
		setValues((prev) => {
			const newValues = [...prev];
			newValues[page][index] = e.target.value;
			return newValues;
		});
	};

	useEffect(() => {
		fetch(`${SERVER_URL}/get-output/${uid}`)
			.then((res) => res.json())
			.then((data) => {
				const { status, data: outputData, error } = data;
				if (status) {
					setData(outputData);
					setValues(
						outputData.fields.map(() => {
							return new Array(outputData.fields.length).fill("");
						})
					);
				} else {
					console.error(error);
				}
			})
			.catch((err) => {
				console.error(err);
			});
	}, [uid]);

	function calculateTextPosition(fieldX, fieldY, w, h) {
		const centeredY = fieldY;
		const alignedX = fieldX;
		return { x: alignedX, y: centeredY };
	}

	const handleDownloadAsPDF = () => {
		const pdf = new jsPDF();
		const divs = document.querySelectorAll(".pdf-page");

		divs.forEach((div, i) => {
			const img = div.querySelector("img");
			const fields = div.querySelectorAll("input");
			const text = div.nextElementSibling;
			const imgData = img.src;
			const imgWidth = img.width;
			const imgHeight = img.height;
			const pdfWidth = 210;
			const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
			pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
			fields.forEach((field, j) => {
				const x = (field.offsetLeft * pdfWidth) / imgWidth;
				const y = (field.offsetTop * pdfHeight) / imgHeight;
				const width = (field.offsetWidth * pdfWidth) / imgWidth;
				const height = (field.offsetHeight * pdfHeight) / imgHeight;
				// pdf.rect(x, y, width, height);
				const fontSize = Number(
					getComputedStyle(field).fontSize.replaceAll("px", "")
				);
				const ptFontSize = (fontSize * 72) / 96;
				pdf.setFontSize(ptFontSize);
				const position = calculateTextPosition(
					x,
					y,
					width,
					height,
				);
				pdf.text(position.x, position.y + ptFontSize/4, field.value);
			});
			const texts = text.querySelectorAll("text");
			texts.forEach((text) => {
				const x = 0;
				const y = pdfHeight + 10;
				pdf.text(x, y, text.innerText);
			});
			if (i !== divs.length - 1) {
				pdf.addPage();
			}
		});
		const fileName =  `${uid}_out.pdf`;
		pdf.save(fileName);
	};

	useEffect(() => {
		if (!data?.meta) {
			return;
		}
	}, [data]);

	return (
		!!data && (
			<div className="flex flex-col gap-4 overflow-auto">
				<div className="flex justify-between items-center">
					<button
						onClick={handleDownloadAsPDF}
						className="px-4 py-2 bg-blue-500 text-white rounded"
					>
						Download as PDF
					</button>
				</div>
				{new Array(data.meta.pages).fill(0).map((_, i) => (
					<div className="grid grid-cols-[70%,30%] overflow-hidden w-full">
						<div className="w-full overflow-auto pdf-page">
							<div
								key={i}
								style={{
									width: data.meta.width,
									height: data.meta.height,
								}}
								className={`border-2 border-blue-500 relative`}
							>
								<img
									src={`${SERVER_URL}/uploads/${uid}_page_${i}.jpg`}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										height: "100%",
									}}
									alt="page"
								/>
								{data.fields[i].map((field, index) => (
									<input
										key={index}
										onChange={handleChange}
										value={values[i][index]}
										id={`field-${i}-${index}`}
										className="absolute border-2 border-green-500"
										style={{
											top: field[1],
											left: field[0],
											width: field[2],
											height: field[3],
										}}
										placeholder="Enter text"
									/>
								))}
							</div>
						</div>
						<div className="w-full overflow-auto">
							{!!data?.texts &&
								data.texts[i].map((text, index) => (
									<text
										key={index}
										className=" w-full border-2 border-green-500 block"
									>
										{text}
									</text>
								))}
						</div>
					</div>
				))}
			</div>
		)
	);
}
