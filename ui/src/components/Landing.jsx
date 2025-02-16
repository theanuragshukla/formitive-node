import { Sparkles, Wrench, Rocket } from "lucide-react";
import { useEffect } from "react";
import FileUpload from "./common/FileUpload";
import Spacer from "./common/Spacer";
import ReactGA from "react-ga4";

const Landing = () => {

	useEffect(()=>{
		ReactGA.send({ hitType: "pageview", page: "/", title: "Landing Page" });
	}, [])

	const cards = [
		{
			Icon: Sparkles,
			heading: "1. Upload your documents",
			description:
				"Upload any PDF that is missing form fields with no sign up or payment needed.",
		},
		{
			Icon: Wrench,
			heading: "2. Fill in Form Fields",
			description:
				"Our AI will figure out where fields belong and insert them for you. Then use our powerful web editor to fill in fields and make any other PDF edits.",
		},
		{
			Icon: Rocket,
			heading: "3. Download PDF",
			description:
				"Get your perfectly filled PDF in seconds. Review, edit if needed, and you're done!",
		},
	];

	return (
		<div className="min-h-screen pt-8 bg-black">
			<div className="container mx-auto px-6 md:px-16">
				<div className="grid md:grid-cols-2 gap-12 items-center">
					<div>
						<h1 className="text-5xl md:text-6xl font-semibold mb-6">
							Your Paperwork{" "}
							<span className="bg-gradient-to-r from-[#FFF3DB] to-[#FFDA8F] text-transparent bg-clip-text">
								on Autopilot
							</span>
						</h1>
						<p className="text-xl text-gray-300 mb-8">
							The first AI PDF editor for doers. We combine a sleek manual
							interface with AI smarts to help you fill, edit, and finish your
							paperwork faster.
						</p>
					</div>
					<div className="flex justify-center">
						<div className="relative p-4 min-h-[300px] rounded-2xl bg-header-image mr-0 max-w-md w-full overflow-hidden shadow-lg">
							<FileUpload />
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-6 py-20 md:px-16">
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
					{cards.map((card, index) => (
						<div key={index} className="bg-white/10 p-8 rounded-2xl">
							<card.Icon className="w-6 h-6 stroke-[#FFDA8F]" />
							<Spacer/>
							<h3 className="text-2xl font-bold">{card.heading}</h3>
							<p className="text-gray-400">{card.description}</p>
						</div>
					))}
				</div>
			</div>

			<footer className="container mx-auto px-6 py-8 md:px-16 text-center text-gray-400">
				© 2025 Formitive. All rights reserved.
			</footer>
		</div>
	);
};

export default Landing;
