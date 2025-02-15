import { BrowserRouter, Route, Routes } from "react-router-dom";
import Edit from "./components/Edit";
import HomeLayout from "./layouts/HomeLayout";
import Landing from "./components/Landing";
import Contact from "./components/Contact";
import RootLayout from "./layouts/RootLayout";
import About from "./components/About";
import ReactGA from "react-ga4";
import { GOOGLE_ANALYTICS_ID } from "./constants";
import { useEffect } from "react";

export default function Router() {
	useEffect(() => {
		ReactGA.initialize(GOOGLE_ANALYTICS_ID);
	}, []);
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<RootLayout />}>
					<Route element={<HomeLayout />}>
						<Route path="/" element={<Landing />} />
					</Route>
					<Route path="/edit/:uid" element={<Edit />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/about" element={<About />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
