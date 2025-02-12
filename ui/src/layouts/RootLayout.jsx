import { Outlet } from "react-router-dom";
import Nav from "../components/common/Nav";
import { useRef, useState } from "react";

export default function RootLayout() {
	const [hideNav, setHideNav] = useState(false);
	const navRef = useRef(null)
	return (
		<div className="flex flex-col">
			{
				!hideNav && <Nav ref={navRef} />
			}
			<div className={`relative flex flex-col`}>
			<Outlet context={{
				setHideNav
			}} />
			</div>
		</div>
	);
}

