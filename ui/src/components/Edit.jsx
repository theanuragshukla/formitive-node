import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import WebViewer from "@pdftron/webviewer";
import { EVENT_STATUS, REMOVE_BUTTONS, SERVER_URL } from "../constants";
import ChatBox from "./common/ChatBox";
import { X, MessageSquare, ChevronRight, ChevronLeft } from "lucide-react";
import FeedbackPopup from "./common/FeedbackPopup";
import { post_feedback } from "../data/managers/contact";
import ReactGA from "react-ga4";
import { connectSocket } from "../data/socket";
import useEvents from "../hooks/useEvents";

const Edit = () => {
  const viewer = useRef(null);
  const { uid } = useParams();
  const [instance, setInstance] = useState(null);
  const navigate = useNavigate();
  const [jsonData, setJsonData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const { navRef, setHideNav } = useOutletContext();
  const navHeight = navRef?.current?.clientHeight || 0;
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { events, addEvent: handleEvent, updateEvent } = useEvents();
  const [annotationsLoaded, setAnnotationsLoaded] = useState(false);
  const [status, setStatus] = useState({
    pdf_status: EVENT_STATUS.PENDING,
    json_status: EVENT_STATUS.PENDING,
  });

  const [formFields, setFormFields] = useState([]);

  const [updates, setUpdates] = useState([]);

  const handleAddEvent = async (input) => {
    const id = handleEvent({
      input: input,
      status: EVENT_STATUS.LOADING,
    });
    try {
      const res = await fetch(`${SERVER_URL}/chat/${uid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ msg: input }),
      });
      const { status, data, error } = await res.json();
      if (status) {
        const { updates } = JSON.parse(data);
        const response = !!updates
          ? updates.map(({ id, key, previous_data, data }) => {
              return `${key} was updated from ${previous_data} to ${data}`;
            })
          : "No field can be updated";
        setUpdates((prev) => [...prev, ...updates]);
        updateEvent(id, { status: EVENT_STATUS.SUCCESS, output: response });
      } else {
        throw new Error(error);
      }
    } catch (err) {
      console.error(err);
      updateEvent(id, { status: EVENT_STATUS.FAILURE, error: err.message });
    }
  };

  const loadDocument = async (uid) => {
    instance.UI.loadDocument(`${SERVER_URL}/uploads/${uid}_out.pdf`);
  };

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

  const initWebViewer = async () => {
    if (instance) return;
    const id = handleEvent({
      id: "init",
      input: "Loading PDF Viewer...",
      status: EVENT_STATUS.LOADING,
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
    updateEvent(id, {
      status: EVENT_STATUS.SUCCESS,
      input: "PDF Viewer Loaded",
    });

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

    documentViewer.addEventListener("annotationsLoaded", () => {
      setAnnotationsLoaded(true);
      const fieldManager = documentViewer
        .getAnnotationManager()
        .getFieldManager();
      handleUpdateFieldName(fieldManager);
    });

    /* const fieldManager = documentViewer
      .getAnnotationManager()
      .getFieldManager();
    const fields = fieldManager.getFields();
    updates.forEach(({ id, data, key }) => {
      const field = fields.find((field) => {
        field.widgets.forEach(annot=>annot.loa)
        // const customData = field.widgets[0]?.getCustomData()
        // console.log(">>>", customData);
        // return customData?.id === id;
      });
      console.log(">>>", id, data, field);
      if (!field) return;
      field.setValue(data);
    }); */
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

  const handleStatusBoth = ({ pdf_status, json_status }) => {
    console.log(">>>", pdf_status, json_status);
    if (
      pdf_status === EVENT_STATUS.FAILURE ||
      json_status === EVENT_STATUS.FAILURE
    ) {
      navigate("/");
      alert("Failed to parse the file. Please try again.");
      return;
    }
    setStatus({ pdf_status, json_status });
  };

  const handleSocketStatus = ({ status, uid, type }) => {
    console.log(">>>", status, type);
    if (status === EVENT_STATUS.FAILURE) {
      alert("Failed to parse the file. Please try again.");
      navigate("/");
      return;
    }
    setStatus((prev) => ({ ...prev, [type]: status }));
  };

  useEffect(() => {
    console.log(">>> Connecting to server", uid);
    const socket = connectSocket();

    const handleConnect = () => {
      console.log(">>> Connected to server");
      socket.emit("join", { uid });
    };

    const handleUpdate = ({ id, status, output, error }) => {
      updateEvent(id, { status, output, error });
    };

    const handleDisconnect = () => {
      console.log(">>> Disconnected from server");
    };

    socket.on("connect", handleConnect);
    socket.on("update", handleUpdate);
    socket.on("status_both", handleStatusBoth);
    socket.on("status", handleSocketStatus);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("update", handleUpdate);
      socket.off("status_both", handleStatusBoth);
      socket.off("status", handleSocketStatus);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, [uid]);

  const fetchJSONData = async () => {
    const id = handleEvent({
      id: "fetch",
      input: "Fetching PDF Data...",
      status: EVENT_STATUS.LOADING,
    });
    if (status.pdf_status !== EVENT_STATUS.SUCCESS) {
      return;
    }
    try {
      const res = await fetch(`${SERVER_URL}/uploads/${uid}.json`);
      const data = await res.json();
      if (JSON.stringify(jsonData) !== JSON.stringify(data)) {
        setJsonData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      updateEvent(id, {
        status: EVENT_STATUS.SUCCESS,
        input: "PDF Data Fetched",
      });
    }
  };

  const fetchFieldsData = async () => {
    const id = handleEvent({
      id: "fetch_fields",
      input: "Fetching Form Fields...",
      status: EVENT_STATUS.LOADING,
    });
    if (status.json_status !== EVENT_STATUS.SUCCESS) {
      return;
    }
    try {
      const res = await fetch(`${SERVER_URL}/form_fields/${uid}`);
      const { status, data, error } = await res.json();
      if (status) {
        setFormFields(data);
      } else {
        switch (error) {
          case "IN_PROGRESS":
            return;
          default:
            alert(
              "An error occurred while fetching form fields. Please try again."
            );
            navigate("/");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      updateEvent(id, {
        status: EVENT_STATUS.SUCCESS,
        input: "Form Fields Fetched",
      });
    }
  };
  useEffect(() => {
    if (!uid) return;
    fetchJSONData();
  }, [uid, status.pdf_status]);

  useEffect(() => {
    if (!uid) return;
    fetchFieldsData();
  }, [uid, status.json_status]);

  const handleUpdateFieldName = async (fieldManager) => {
    if (!formFields || formFields.length === 0) return;
    const allFields = formFields
      .reduceRight((acc, page) => {
        return [...page, ...acc];
      }, [])
      .map((o) => {
        return { ...o, rect: o.rect.map((o) => Math.floor(o)) };
      });

    const fields = fieldManager.getFields();

    // Define a tolerance for coordinate comparison
    const tolerance = 20; // Adjust this value as needed
    fields.forEach(async (field) => {
      const fieldRect = field.widgets[0].getRect();
      const [x1, y1, x2, y2] = Object.values(fieldRect).map((o) =>
        Math.floor(o)
      );

      const match = allFields.find((o) => {
        const [rectX1, rectY1, rectX2, rectY2] = o.rect;

        // Check if the coordinates are within the tolerance range
        return (
          Math.abs(x1 - rectX1) <= tolerance &&
          Math.abs(y1 - rectY1) <= tolerance &&
          Math.abs(x2 - rectX2) <= tolerance &&
          Math.abs(y2 - rectY2) <= tolerance
        );
      });
      fieldManager.updateFieldName(field, match?.key || field.name);
      await field.widgets[0].setCustomData("id", match?.id || "");
    });
  };

  useEffect(() => {
    if (!instance || !annotationsLoaded || status.json_status !== "SUCCESS") return;
    const { documentViewer } = instance.Core;
      const fieldManager = documentViewer
        .getAnnotationManager()
        .getFieldManager();
      handleUpdateFieldName(fieldManager);
    
  }, [instance, formFields, status, annotationsLoaded]);

  useEffect(() => {
    if (!instance) return;
    const { documentViewer } = instance.Core;
    const fieldManager = documentViewer
      .getAnnotationManager()
      .getFieldManager();
    const fields = fieldManager.getFields();
    updates.forEach(({ id, data, key }) => {
      const field = fields.filter((field) => {
        /* const customData = field.widgets[0]?.getCustomData()
        console.log(">>>", customData);
        return customData?.id === id; */
        return field.name === key;
      })[0];
      if (!field) return;
      field.setValue(data);
    });
  }, [updates, instance]);

  useEffect(() => {
    async function init() {
      if (!instance || !jsonData.pages || !uid || !status.pdf_status) return;
      if (jsonData.pages.some((page) => page.formElements.length === 0)) {
        alert(
          "We couldn't find any places to add fields. You can manually add any fields and edit the PDF as needed!"
        );
      }
      loadDocument(uid);
      setLoading(false);
    }
    init();
  }, [jsonData, uid, instance, status.pdf_status]);

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
              {!isChatCollapsed && (
              <ChatBox events={events} handleSend={handleAddEvent} isDisabled={!annotationsLoaded || !formFields.length} isLoading={!!events.find(o=>[EVENT_STATUS.LOADING, EVENT_STATUS.PENDING].includes(o.status))} />
              )}
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
              <ChatBox events={events} handleSend={handleAddEvent} isDisabled={!annotationsLoaded || !formFields.length} isLoading={events[events.some(o=>[EVENT_STATUS.LOADING, EVENT_STATUS.PENDING].includes(o.status))]} />
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
