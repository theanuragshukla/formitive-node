import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { SERVER_URL } from "../../constants";
import { Upload, FileText } from "lucide-react";
import Button from "./Button";
import ReactGA from "react-ga4";

const FileUpload = ({ styles }) => {
	const { file, setFile } = useOutletContext();
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingExample, setIsLoadingExample] = useState(false);
	const navigate = useNavigate();

	const exampleDocs = [
		{
			title: "Job Application.pdf",
			url: "jobApplication.pdf",
		},
		{
			title: "Credit Application.pdf",
			url: "creditapp.pdf",
		},
		{
			title: "Registration Form.pdf",
			url: "RegistrationForm.pdf",
		},
	];

	const handleFileChange = (e) => {
		ReactGA.event({ category: "PDF Action", action: "Select PDF" });
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

	const handleExampleSelect = async (url, title) => {
		try {
			setIsLoadingExample(true);
			setError("");
			ReactGA.event({
				category: "PDF Action",
				action: "Select Example PDF",
				label: title,
			});
			const response = await fetch(`${SERVER_URL}/samples/${encodeURIComponent(url)}`);
			const blob = await response.blob();
			const file = new File([blob], title, { type: "application/pdf" });
			setFile(file);
		} catch (err) {
			setError("Failed to load example document. Please try again.");
		} finally {
			setIsLoadingExample(false);
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
				category: "PDF Action",
				action: "PDF Uploaded",
			});

			const res = await fetch(`${SERVER_URL}/upload`, {
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

	const handleRemoveFile = () => {
		setFile(null);
		setError("");
	};

	return (
		<div
			className={`w-full h-full bg-black/70 rounded-2xl p-6 ${styles || ""}`}
		>
			<div className="flex flex-col h-full gap-4">
				<div className=" rounded-lg p-4 flex flex-col">
					<div className="flex-1 flex flex-col items-center justify-center">
						{file ? (
							<div className="text-center">
								<Upload className="h-8 w-8 text-gray-300 mx-auto" />
								<p className="mt-2 text-sm text-gray-300 truncate max-w-xs">
									{file.name}
								</p>
								<button
									onClick={handleRemoveFile}
									className="mt-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
								>
									Remove file
								</button>
							</div>
						) : (
							<div
								onClick={() => document.getElementById("fileInput").click()}
								className="text-center cursor-pointer"
							>
								<Upload className="h-8 w-8 text-gray-300 mx-auto" />
								<p className="mt-2 text-sm text-gray-300">
									Drop PDF here or click to upload
								</p>
							</div>
						)}
					</div>

					{!file && (
						<div className="h-32 border-t border-gray-800 pt-3">
							<p className="text-gray-400 text-xs mb-2">Example Documents</p>
							<div className="space-y-1 overflow-y-auto max-h-20">
								{exampleDocs.map((doc, index) => (
									<button
										key={index}
										onClick={() => handleExampleSelect(doc.url, doc.title)}
										disabled={isLoadingExample}
										className="flex items-center gap-2 text-gray-300 hover:text-[#FFDA8F] transition-colors w-full text-left px-2 py-1 rounded hover:bg-white/5"
									>
										<FileText className="w-4 h-4 flex-shrink-0" />
										<span className="text-xs truncate">{doc.title}</span>
									</button>
								))}
							</div>
						</div>
					)}
				</div>

				{error && (
					<div className="mt-2 text-xs md:text-sm text-red-400 font-bold">
						<p className="text-center">{error}</p>
					</div>
				)}

				<div>
					<Button
						styles={
							!file
								? "bg-gray-900 text-gray-500 cursor-not-allowed"
								: isSubmitting || isLoadingExample
								  ? "bg-gray-800 text-gray-400"
								  : "bg-[#FFDA8F] text-gray-900 font-bold hover:bg-[#FFE5B1]"
						}
						handleClick={handleSubmit}
						isLoading={isSubmitting || isLoadingExample}
						isDisabled={!file || isSubmitting || isLoadingExample}
					/>
				</div>
			</div>

			<input
				id="fileInput"
				type="file"
				accept=".pdf"
				onChange={handleFileChange}
				className="hidden"
			/>
		</div>
	);
};

export default FileUpload;
