import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Edit from "./components/Edit";

export default function Router() {
	return (
		<HashRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/edit/:uid" element={<Edit />} />
			</Routes>
		</HashRouter>
	);
}
