import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { SERVER_URL } from "../../constants";
import { Upload } from "lucide-react";
import Button from "./Button";
import ReactGA from "react-ga4";

const FileUpload = ({ styles }) => {
	const { file, setFile } = useOutletContext();
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const handleFileChange = (e) => {
		ReactGA.event({ category: "UploadPDF", action: "Select" });
		const selectedFile = e.target.files[0];
		if (selectedFile) {
			if (selectedFile.type === "application/pdf") {
				setFile(selectedFile);
				setError("");
			} else {
				setFile(null);
				setError("Only PDF files are allowed.");
			}
		}
	};

	const handleSubmit = async () => {
		if (!file) {
			setError("Please select a file before submitting.");
			return;
		}

		const formData = new FormData();
		formData.append("file", file);

		try {
			setIsSubmitting(true);
			setError("");

			ReactGA.event({
				category: "UploadPDF",
				action: "Click",
			});
			const res = await fetch(`${SERVER_URL}/upload`, {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				const errorData = await res.json();
				setError(
					errorData.error ||
						"An error occurred while uploading the file."
				);
				return;
			}

			const result = await res.json();
			const { status, data, error } = result;
			if (status) {
				return navigate(`edit/${data.uid}`);
			} else {
				setError(
					error ||
						"An error occurred while uploading the file."
				);
			}
		} catch (err) {
			setError("An error occurred while uploading the file.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleRemoveFile = () => {
		setFile(null);
		setError("");
	};

	return (
		<div className={`p-4 w-full ${styles}`}>
			<div
				onClick={() =>
					!file &&
					document
						.getElementById("fileInput")
						.click()
				}
				className="rounded-lg p-8 text-center cursor-pointer bg-gray-50 opacity-90"
			>
				{file ? (
					<div className="flex flex-col items-center justify-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
						<Upload className="h-12 w-12 text-gray-400" />
						<p className="mt-2 text-sm text-gray-600 truncate max-w-xs">
							{file.name}
						</p>
						<button
							onClick={
								handleRemoveFile
							}
							className="mt-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
						>
							Remove file
						</button>
						<input
							id="fileInput"
							type="file"
							accept=".pdf"
							onChange={
								handleFileChange
							}
							className="hidden"
						/>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
						<Upload className="h-12 w-12 text-gray-400" />
						<p className="mt-2 text-sm text-gray-600">
							Drop PDF here or click
							to upload
						</p>
						<input
							id="fileInput"
							type="file"
							accept=".pdf"
							onChange={
								handleFileChange
							}
							className="hidden"
						/>
					</div>
				)}
			</div>
			{error && (
				<div className="mt-4 text-sm text-red-600">
					<p>{error}</p>
				</div>
			)}

			<Button
				styles={
					!file
						? "bg-gray-100 text-gray-400 cursor-not-allowed"
						: isSubmitting
						  ? "bg-blue-100 text-blue-400"
						  : "bg-blue-600 text-white hover:bg-blue-700"
				}
				handleClick={handleSubmit}
				isLoading={isSubmitting}
				isDisabled={!file || isSubmitting}
			/>
		</div>
	);
};

export default FileUpload;
