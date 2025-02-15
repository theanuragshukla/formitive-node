import { getClient } from "../client";

export const reqModal = async (func) => {
  try {
    const { status, data } = await func();
    if (status === 200) {
      return data;
    } else {
      return {
        status: false,
        msg: `request failed with code ${status}`,
      };
    }
  } catch (e) {
    console.log(e);
    return {
      status: false,
      msg: "Something Unexpected happened",
    };
  }
};

export const post_contact = (values) => {
  return reqModal(() => getClient().post("/contact", values));
};

export const post_feedback = (values) => {
  return reqModal(() => getClient().post("/feedback", values));
};
