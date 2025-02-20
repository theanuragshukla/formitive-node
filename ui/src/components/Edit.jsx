import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import WebViewer from "@pdftron/webviewer";
import { REMOVE_BUTTONS, SERVER_URL } from "../constants";
import { sleep } from "../utils";
import ChatBox from "./common/ChatBox";
import { X, MessageSquare, ChevronRight, ChevronLeft } from "lucide-react";
import FeedbackPopup from "./common/FeedbackPopup";
import { post_feedback } from "../data/managers/contact";
import ReactGA from "react-ga4";
import { toast } from "react-toastify";

const Edit = () => {
  const viewer = useRef(null);
  const { uid } = useParams();
  const [instance, setInstance] = useState(null);
  const navigate = useNavigate();
  const [retry, setRetry] = useState(3);
  const [jsonData, setJsonData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const { navRef, setHideNav } = useOutletContext();
  const navHeight = navRef?.current?.clientHeight || 0;
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const initWebViewer = async () => {
    if (instance) return;
    const id = toast("Setting up...", {
      isLoading: true,
      autoClose: false,
    });
    const ins = await WebViewer(
      {
        path: "/webviewer/lib/public",
        enableFilePicker: false,
        enableAnnotations: true,
        licenseKey:
          "Lab06  Inc :OEM:Lab06  Inc  Web::B+:AMS(20260130):D03A73DBE75629161C5A1245EBCB10E8BDFCF12CB31D691CAFD9415282BEF5C7",
      },
      viewer.current
    );
    toast.dismiss(id);

    const { documentViewer, Annotations } = ins.Core;

    documentViewer.addEventListener("documentLoaded", () => {
      const customStyles = (widget) => {
        if (widget instanceof Annotations.TextWidgetAnnotation) {
          return {
            "background-color": "rgba(100, 149, 237, 0.2)",
          };
        }
      };
      Annotations.WidgetAnnotation.getCustomStyles = customStyles;
    });
    setInstance(ins);
  };

  useEffect(() => {
    initWebViewer();
  }, []);

  useEffect(() => {
    setHideNav(true);
    ReactGA.send({ hitType: "pageview", page: "/edit", title: "Edit Page" });
    return () => setHideNav(false);
  }, [setHideNav]);

  useEffect(() => {
    if (retry <= 0 || !uid) return;
    const fetchData = async () => {
      const id = toast("Processing Document...", {
        isLoading: true,
        autoClose: false,
      });
      try {
        await sleep(2000);
        const res = await fetch(`${SERVER_URL}/uploads/${uid}.json`);
        const data = await res.json();

        if (data.status === false) {
          if (data.error.toString().toLowerCase().includes("failed")) {
            alert("Failed to parse the file. Please try again.");
            navigate("/");
          } else if (data.error.toString().toLowerCase().includes("progress")) {
            await sleep(3000);
          } else {
            alert("Invalid file. Please try again.");
            navigate("/");
          }
        } else {
          if (JSON.stringify(jsonData) !== JSON.stringify(data)) {
            setRetry(0);
            setJsonData(data);
          }
        }
      } catch (err) {
        console.error(err);
        setRetry((prev) => prev - 1);
      } finally {
        toast.dismiss(id);
      }
    };
    fetchData();
  }, [uid, retry, jsonData, navigate]);

  const loadDocument = async (uid) => {
    instance.UI.loadDocument(`${SERVER_URL}/uploads/${uid}_out.pdf`);
  };

  useEffect(() => {
    async function init() {
      if (!instance || !jsonData.pages || !uid) return;
      if (jsonData.pages.some((page) => page.formElements.length === 0)) {
        alert(
          "We couldn't find any places to add fields. You can manually add any fields and edit the PDF as needed!"
        );
      }
      loadDocument(uid);
      setLoading(false);
    }
    init();
  }, [jsonData, uid, instance]);

  const handleDownload = async ({ rating, feedback }) => {
    ReactGA.event({ category: "PDF Action", action: "Download PDF Initiate" });
    try {
      const { status, msg, data, error } = await post_feedback({
        rating,
        feedback,
        uid,
      });
      if (status) {
        ReactGA.event({
          category: "PDF Action",
          action: "Download PDF Success",
        });
        instance.UI.downloadPdf({
          filename: `${data.original_name || uid}.pdf`,
        });
      } else {
        alert(msg);
        console.error(error);
      }
    } finally {
      setFeedbackOpen(false);
    }
  };

  useEffect(() => {
    if (!instance) return;
    const theme = instance.UI.Theme;
    instance.UI.setTheme(theme.DARK);

    const HomeButton = {
      dataElement: "homeButton",
      label: "Home",
      onClick: () => navigate("/"),
      icon: "/house.svg",
    };

    const downloadButton = {
      dataElement: "testFlyoutButton",
      label: "Download",
      onClick: () => setFeedbackOpen(true),
      icon: "icon-download",
    };

    const mainMenuFlyout = instance.UI.Flyouts.getFlyout("MainMenuFlyout");
    const menuItems = mainMenuFlyout.items;
    const downloadIndex = menuItems.findIndex(
      (item) => item.dataElement === "downloadButton"
    );
    menuItems[downloadIndex] = downloadButton;
    menuItems[0] = HomeButton;
    mainMenuFlyout.setItems(
      menuItems.filter((item) => !REMOVE_BUTTONS.includes(item.dataElement))
    );
  }, [instance]);

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ height: `calc(100vh - ${navHeight}px)`, top: navHeight }}
    >
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <div ref={viewer} className="w-full h-full" />
        </div>

        {/* Desktop Chat Panel */}
        <div
          className={`hidden md:flex transition-all duration-300 ${
            isChatCollapsed ? "w-12" : "w-96"
          }`}
        >
          <div className="flex-1 flex">
            <button
              onClick={() => setIsChatCollapsed(!isChatCollapsed)}
              className="h-full w-12 flex items-center justify-center"
            >
              {isChatCollapsed ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>

            <div
              className={`flex-1 transition-all duration-300 ${
                isChatCollapsed ? "w-0 opacity-0" : "w-84 opacity-100"
              }`}
            >
              {!isChatCollapsed && <ChatBox />}
            </div>
          </div>
        </div>

        {/* Mobile Chat Panel */}
        <div
          className={`
          md:hidden fixed inset-0 
          transition-transform duration-300 z-50
          ${isMobileChatOpen ? "translate-x-0" : "translate-x-full"}
        `}
        >
          <div className="h-full w-full bg-white flex flex-col">
            <div className="h-14 border-b flex items-center justify-between px-4 bg-black text-white">
              <h2 className="font-medium">Chat</h2>
              <button
                onClick={() => setIsMobileChatOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatBox />
            </div>
          </div>
        </div>

        {/* Mobile Chat Toggle Button */}
        <button
          onClick={() => setIsMobileChatOpen(true)}
          className="md:hidden fixed right-4 bottom-4 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg z-40"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>

      <FeedbackPopup
        onSubmit={handleDownload}
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </div>
  );
};

export default Edit;
