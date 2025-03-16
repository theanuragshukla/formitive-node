import { useState } from "react";
import { getUid } from "../utils";

const useEvents = () => {
	const [events, setEvents] = useState([])

  const addEvent = (input) => {
    const id = input.id || getUid();
    setEvents((prev) => {
      const exists = prev.find((event) => event.id === id);
      if (exists)
        return [...prev.filter((event) => event.id !== id), { id, ...input }];
      else return [...prev, { id, ...input }];
    });
    return id;
  };

  const updateEvent = (id, data) => {
    try {
      setEvents((prev) =>
        prev.map((event) => {
          if (event.id === id) {
            return { ...event, ...data };
          }
          return event;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

	return { events, addEvent, updateEvent }

}

export default useEvents
