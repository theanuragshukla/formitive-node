import { Outlet } from "react-router-dom";
import Nav from "../components/common/Nav";
import { useRef, useState } from "react";
import { Bounce, ToastContainer } from "react-toastify";

export default function RootLayout() {
	const [hideNav, setHideNav] = useState(false);
	const navRef = useRef(null);
	return (
		<div className="flex flex-col">
			{!hideNav && <Nav ref={navRef} />}
			<div className={`relative flex flex-col`}>
				<ToastContainer
					position="top-right"
					autoClose={3000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick={false}
					rtl={false}
					theme="dark"
					transition={Bounce}
				/>
				<Outlet
					context={{
						setHideNav,
					}}
				/>
			</div>
		</div>
	);
}
