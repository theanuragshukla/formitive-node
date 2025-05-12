import axios from "axios";
const baseURL = process.env.REACT_APP_SERVER_URL ||  `${window.location.origin}:8000`;

export const getClient = () => {
  return axios.create({
    baseURL: baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

