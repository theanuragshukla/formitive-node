import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { SERVER_URL } from "../constants";
import Nav from "./Nav";
import { Upload } from 'lucide-react';

const FileUpload = () => {
	const {file, setFile} = useOutletContext()
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
		 <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div 
          onClick={() => document.getElementById("fileInput").click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer bg-gray-50"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Drop PDF here or click to upload</p>
          <input
            id="fileInput"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 truncate">{file.name}</p>
            <button 
              onClick={handleRemoveFile}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-red-600">
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || isSubmitting}
          className={`mt-6 w-full px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${!file 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : isSubmitting
              ? 'bg-blue-100 text-blue-400'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2"
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
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Processing...
            </div>
          ) : (
						'Analyse PDF'
          )}
        </button>
      </div>
    </div>
	);
};

export default FileUpload;
