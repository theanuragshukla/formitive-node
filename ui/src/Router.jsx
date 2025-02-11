import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Edit from "./components/Edit";
import HomeLayout from "./layouts/HomeLayout";

export default function Router() {
	return (
		<HashRouter>
			<Routes>
				<Route element={<HomeLayout />}>
					<Route path="/" element={<Home />} />
				</Route>
				<Route path="/edit/:uid" element={<Edit />} />
			</Routes>
		</HashRouter>
	);
}
