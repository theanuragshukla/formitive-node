export const REMOVE_BUTTONS = [
	'saveAsButton', 'fullscreenButton', 'printButton', 'settingsButton'
]
export const GOOGLE_ANALYTICS_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;
export const SERVER_URL = process.env.REACT_APP_SERVER_URL || `${window.location.origin}:8000`;

export const EVENT_STATUS = {
	SUCCESS: "SUCCESS",
	FAILURE: "FAILURE",
	LOADING: "LOADING",
	PENDING: "PENDING",
}
