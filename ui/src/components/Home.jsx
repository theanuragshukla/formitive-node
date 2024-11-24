import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

			const res = await fetch("http://localhost:5000/upload", {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				const errorData = await res.json();
				setError(
					errorData.error || "An error occurred while uploading the file."
				);
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

	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gray-100">
			<div className="bg-white p-6 rounded shadow-md w-80">
				<h2 className="text-lg font-semibold mb-4">Upload a PDF File</h2>
				<input
					type="file"
					accept=".pdf"
					onChange={handleFileChange}
					className="block w-full text-sm text-gray-600
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
				/>
				{file && (
					<div className="mt-4 text-green-600">
						<p>Selected File:</p>
						<p className="truncate">{file.name}</p>
					</div>
				)}
				{error && (
					<div className="mt-4 text-red-600">
						<p>{error}</p>
					</div>
				)}
				<button
					onClick={handleSubmit}
					disabled={isSubmitting}
					className={`mt-4 px-4 py-2 w-full text-white font-semibold rounded
            ${isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}
            disabled:cursor-not-allowed`}
				>
					{isSubmitting ? "Submitting..." : "Submit"}
				</button>
			</div>
		</div>
	);
};

export default FileUpload;
