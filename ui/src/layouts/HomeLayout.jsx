import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Outlet } from "react-router-dom";

export default function HomeLayout() {
	const [file, setFile] = useState(null);

	const onDrop = useCallback((acceptedFiles) => {
		setFile(acceptedFiles[0]);
	}, []);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		maxFiles: 1,
		accept: {
			"application/pdf": ".pdf",
		},
		noClick: true,
		noKeyboard: true,
		multiple: false
	});
	return (
		<div {...getRootProps()} className="relative">
			<input {...getInputProps()} className="hidden" />
			 {isDragActive && (
          <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg border-2 border-dashed border-blue-400 z-10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-blue-500" />
                <p className="mt-2 text-sm font-medium text-blue-600">
                  Drop PDF here
                </p>
              </div>
            </div>
          </div>
        )}
			<Outlet context={{ file, setFile }} />
		</div>
	);
}
