import { useEffect, useState } from "react";

import React from "react";
import { EVENT_STATUS } from "../../constants";
import Spacer from "./Spacer";
import { BadgeMinus, Check, Info, Loader} from "lucide-react";

const renderStatusIcon = (status) => {
	switch (status) {
		case EVENT_STATUS.LOADING:
			return <Loader className="animate-spin h-5 w-5 mr-2" />;
		case EVENT_STATUS.PENDING:
			return <Info className="h-5 w-5 mr-2" />;
		case EVENT_STATUS.FAILURE:
			return <BadgeMinus className="h-5 w-5 mr-2" />;
		case EVENT_STATUS.SUCCESS:
			return <Check className="h-5 w-5 mr-2" />;
		default:
			return null;
	}
};

const getStatusMessage = (status, error) => {
	switch (status) {
		case EVENT_STATUS.LOADING:
			return "Awaiting response";
		case EVENT_STATUS.PENDING:
			return "Pending...";
		case EVENT_STATUS.FAILURE:
			return error || "Error occurred";
		case EVENT_STATUS.SUCCESS:
			return "Completed successfully";
		default:
			return "";
	}
};

const getStatusColor = (status) => {
	switch (status) {
		case EVENT_STATUS.LOADING:
			return "text-blue-300";
		case EVENT_STATUS.PENDING:
			return "text-yellow-500";
		case EVENT_STATUS.FAILURE:
			return "text-red-500";
		case EVENT_STATUS.SUCCESS:
			return "text-green-500";
		default:
			return "text-gray-500";
	}
};

const getAccentColor = (status) => {
	switch (status) {
		case EVENT_STATUS.LOADING:
			return "border-l-blue-300";
		case EVENT_STATUS.PENDING:
			return "border-l-yellow-500";
		case EVENT_STATUS.FAILURE:
			return "border-l-red-500";
		case EVENT_STATUS.SUCCESS:
			return "border-l-green-500";
		default:
			return "border-l-gray-500";
	}
};

const Event = ({ event: { input, output, status, error} }) => {
	return (
		<div
			className={`bg-[#252525] p-2 rounded mb-4 shadow-lg border-l-2 ${getAccentColor(status)} transition-all duration-300 ease-in-out`}
		>
			<div className="text-sm md:text-base text-white font-medium">{input}</div>
			<Spacer size={2} />
			{status !== EVENT_STATUS.SUCCESS && (
				<div
					className={`flex items-center py-1 px-2 rounded-md ${getStatusColor(status)}  shadow-md transition-all duration-300 ease-in-out`}
				>
					{renderStatusIcon(status)}
					<span className="font-medium text-sm">{getStatusMessage(status, error)}</span>
				</div>
			)}

			{status === EVENT_STATUS.SUCCESS && output && (
				<div className="text-sm md:text-base px-2 text-gray-400 rounded-md">
					{output}
				</div>
			)}
		</div>
	);
};
export default function ChatBox({ events, handleSend }) {
	const [inputMessage, setInputMessage] = useState("");
	const hasUnsavedData = true;

	useEffect(() => {
		const handleBeforeUnload = (e) => {
			if (hasUnsavedData) {
				e.preventDefault();
				e.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [hasUnsavedData]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!inputMessage.trim()) return;
		handleSend(inputMessage);
		setInputMessage("");
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};
	return (
		<div className=" md:order-2 w-full md:w-[330px] bg-black p-2 md:p-4 flex flex-col h-full relative border-l border-[#333333]">
			<h2 className="text-lg font-medium">Document Events</h2>
			<div className="flex-1 overflow-y-auto bg-[#121212] rounded p-1 md:p-2 mb-1 md:mb-2">
				{events.map((event) => (
					<Event key={event.id} event={event} />
				))}
			</div>
			<form onSubmit={handleSubmit} className="flex flex-col gap-1 md:gap-2">
				<textarea
					value={inputMessage}
					onChange={(e) => setInputMessage(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Enter data to fill into the document, e.g. John Smith DOB 1/2/88"
					className="h-16 md:h-24 p-2 text-sm md:text-base bg-[#252525] text-white rounded resize-none"
				/>
				<button
					type="submit"
					className="py-1 md:py-2 bg-[#252525] text-white rounded cursor-pointer text-sm md:text-base"
				>
					Send
				</button>
			</form>
		</div>
	);
}
