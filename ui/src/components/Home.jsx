import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from "../constants";
import Nav from "./Nav";

const FileUpload = () => {
	const [file, setFile] = useState(null);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const handleFileChange = (e) => {
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

	const handleDrop = (e) => {
		e.preventDefault();
		const droppedFile = e.dataTransfer.files[0];
		if (droppedFile) {
			if (droppedFile.type === "application/pdf") {
				setFile(droppedFile);
				setError("");
			} else {
				setFile(null);
				setError("Only PDF files are allowed.");
			}
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
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

			const res = await fetch(`${SERVER_URL}/upload`, {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				const errorData = await res.json();
				setError(errorData.error || "An error occurred while uploading the file.");
				return;
			}

			const result = await res.json();
			const { status, data, error } = result;
			if (status) {
				return navigate(`edit/${data.uid}`);
			} else {
				setError(error || "An error occurred while uploading the file.");
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
		<div className="no-doc-scroll">
			<Nav />
			<div
				className="flex flex-col items-center justify-center h-[calc(100vh-50px)] bg-[#000000] "
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<div className="bg-[#121212] p-6 rounded shadow-md w-80">
					<h2 className="text-lg font-semibold mb-4 text-white">Upload Form</h2>

					{/* Combined File Input and Drag & Drop Area */}
					<div
						className="border border-gray-700 rounded p-4 mb-4 text-center hover:bg-[#252525] text-gray-300 bg-[#121212] cursor-pointer relative"
						onDragOver={handleDragOver}
						onDrop={handleDrop}
						onClick={() => document.getElementById("fileInput").click()}
					>
						Drop PDF here or click to upload
						<input
							id="fileInput"
							type="file"
							accept=".pdf"
							onChange={handleFileChange}
							className="hidden"
						/>
					</div>

					{file && (
						<div className="mt-4 text-green-400 flex items-center">
							<p className="truncate">{file.name}</p>
							<button onClick={handleRemoveFile} className="ml-2 text-red-500">
								&times;
							</button>
						</div>
					)}
					{error && (
						<div className="mt-4 text-red-400">
							<p>{error}</p>
						</div>
					)}
					<button
						onClick={handleSubmit}
						disabled={!file || isSubmitting}
						className={`mt-4 px-4 py-2 w-full text-white font-semibold rounded
            ${
							!file
								? "bg-[#1A1A1A] cursor-not-allowed"
								: isSubmitting
								? "bg-gray-600"
								: "bg-[#252525] hover:bg-gray-700"
						}`}
					>
						{isSubmitting && (
							<svg
								className="animate-spin h-5 w-5 inline-block mr-2"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
							</svg>
						)}
						{isSubmitting ? "Processing..." : "Submit"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default FileUpload;
