import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SERVER_URL } from "../constants";

export default function Edit() {
	const { uid } = useParams();
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
			})
			.catch((err) => {
				console.error(err);
			});
	}, [uid]);

	useEffect(() => {
		if (!data?.meta) {
			return;
		}
	}, [data]);

	return (
		!!data && (
			<div className="flex flex-col gap-4 overflow-auto">
				{new Array(data.meta.pages).fill(0).map((_, i) => (
					<div className="grid grid-cols-[70%,30%] overflow-hidden w-full">
						<div className="w-full overflow-auto">
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
									<text key={index} className="border-2 border-green-500 block">
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
