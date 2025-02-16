export default function Button({
	isLoading,
	handleClick,
	isDisabled,
	styles,
	loadingText,
	btnText,
}) {
	return (
		<button
			onClick={handleClick}
			disabled={isDisabled}
			className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${styles}`}
		>
			{isLoading ? (
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
					{loadingText || "Processing..."}
				</div>
			) : (
				btnText || "Submit"
			)}
		</button>
	);
}
