import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

function Nav({ ref }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const pathname = location.pathname;

  const btns = [
    {
      name: "About",
      link: "/about",
    },
    {
      name: "Contact",
      link: "/contact",
    },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setIsVisible(false);
      setIsMenuOpen(false)
    } else {
      setIsVisible(true);
    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <nav
      ref={ref}
      className={`sticky top-0 px-6 md:px-8 bg-black w-full z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <a href="https://formitive.ai" rel="noopener noreferrer">
              <img
                src="/Formitive-logo-white.svg"
                alt="Formitive Logo"
                className="h-12"
              />
            </a>
          </Link>

          <button
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-300 hover:bg-black/30 transition-colors"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>

          <div className="hidden md:flex items-center space-x-4">
            {btns.map((obj) => (
              <div
                key={obj.name}
                className={`px-3 py-2 rounded-md text-xl font-semibold transition-all duration-200 ease-in-out ${
                  pathname?.includes(obj.name.toLowerCase())
                    ? "bg-white/30 text-white"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Link to={obj.link} className="transition-colors duration-200">
                  {obj.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 pt-2 pb-3 space-y-1 bg-black/95 border-t border-white/10">
          {btns.map((obj) => (
            <div
              key={obj.name}
              className={`transition-colors duration-200 ${
                pathname?.includes(obj.name.toLowerCase())
                  ? "bg-white/30"
                  : "hover:bg-white/10"
              }`}
            >
              <Link
                to={obj.link}
                className="block px-3 py-2 rounded-md text-base font-medium text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                {obj.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Nav;
