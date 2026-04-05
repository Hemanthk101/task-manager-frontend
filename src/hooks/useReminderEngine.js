import { useEffect } from "react";
import { runReminderChecks } from "../services/reminderEngine";

export default function useReminderEngine(reminders) {
  useEffect(() => {
    const checkNow = () => runReminderChecks(reminders || []);
    checkNow();

    const interval = setInterval(checkNow, 30 * 1000); // every 30 sec
    return () => clearInterval(interval);
  }, [reminders]);
}
