// App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import myphoto from "./assets/1.jpg";
import "./App.css";

/**
 * ✅ SYNC SETTINGS
 * Put these in your frontend .env:
 * VITE_API_BASE="http://localhost:8080"  (or your backend URL)
 * VITE_USER_ID="demo"
 */
const API_BASE = import.meta.env.VITE_API_BASE || "";
const USER_ID = import.meta.env.VITE_USER_ID || "demo";
const SYNC_ENABLED = !!API_BASE;

// ---------- small helpers ----------
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function useViewport() {
  const [vp, setVp] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));

  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return vp;
}

function App() {
  // ---------------------------------
  // ✅ Responsive “STAGE” layout (centers the whole UI)
  // - NO zoom scaling
  // - Keeps the SAME laptop interface (two cards side-by-side)
  // - Mobile supported best in LANDSCAPE
  // ---------------------------------
  const { w: VW, h: VH } = useViewport();
  const isLandscape = VW >= VH;

  // The centered stage that holds your whole UI (cards + buttons)
  const STAGE_MAX_W = 1500;
  const STAGE_MAX_H = 900;

  const stageW = Math.floor(clamp(VW * 0.98, 360, STAGE_MAX_W));
  const stageH = Math.floor(clamp(VH * 0.95, 520, STAGE_MAX_H));

  // Keep two-card layout always; shrink widths/gaps on smaller screens
  const gap = Math.floor(clamp(stageW * 0.035, 16, 44));
  let cardW = Math.floor((stageW - gap) / 2);
  cardW = Math.floor(clamp(cardW, 320, 560)); // responsive sizing, not scaling

  // Ensure it never overflows the stage
  if (cardW * 2 + gap > stageW) cardW = Math.floor((stageW - gap) / 2);

  const cardH = Math.floor(clamp(stageH * 0.92, 520, 860));
  const cardTop = Math.floor(clamp((stageH - cardH) / 2, 8, 48));

  // Dynamic ring sizes based on available card width (still same UI, just responsive sizing)
  const RING_BIG = Math.floor(clamp(cardW * 0.42, 160, 200));
  const RING_MID = Math.floor(clamp(cardW * 0.30, 110, 140));

  // Body: two rings side-by-side centered
  const bodyRingGap = Math.floor(clamp(cardW * 0.06, 16, 28));
  const ringRowW = RING_BIG * 2 + bodyRingGap;
  const ringStartX = Math.floor(clamp((cardW - ringRowW) / 2, 8, 40));
  const bodyRingTop = Math.floor(clamp(cardH * 0.06, 40, 70));

  // Mind: big ring centered near top
  const mindTotalTop = Math.floor(clamp(cardH * 0.06, 40, 70));
  const mindTotalLeft = Math.floor((cardW - RING_BIG) / 2);

  // Skin: ring centered near top
  const skinRingTop = Math.floor(clamp(cardH * 0.08, 50, 80));
  const skinRingLeft = Math.floor((cardW - RING_BIG) / 2);

  // Mind header font responsive
  const MIND_HEADER_FONT_SIZE = Math.floor(clamp(cardW * 0.06, 20, 26));

  // ---------------------------------
  // Storage helpers
  // ---------------------------------
  const loadJSON = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };
  const saveJSON = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  // ---------------------------------
  // ✅ IST Helpers (midnight IST reset)
  // ---------------------------------
  const getISTDayKey = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const y = parts.find((p) => p.type === "year")?.value || "0000";
    const m = parts.find((p) => p.type === "month")?.value || "00";
    const d = parts.find((p) => p.type === "day")?.value || "00";
    return `${y}-${m}-${d}`;
  };

  const getISTNowMinutes = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());

    const hh = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const mm = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    return hh * 60 + mm;
  };

  const getMonthKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()}`;
  };

  // ---------------------------------
  // ✅ Backend Sync Helpers
  // ---------------------------------
  const fetchState = async () => {
    const r = await fetch(`${API_BASE}/api/state?userId=${encodeURIComponent(USER_ID)}`);
    if (!r.ok) throw new Error("Failed to fetch state");
    return r.json();
  };

  const saveState = async (state) => {
    await fetch(`${API_BASE}/api/state?userId=${encodeURIComponent(USER_ID)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
  };

  // ---------------------------------
  // Defaults
  // ---------------------------------
  const defaultBodyTasks = useMemo(
    () => [
      { id: 1, label: "Push ups", completed: false },
      { id: 2, label: "Pull ups", completed: false },
      { id: 3, label: "Crunches", completed: false },
      { id: 4, label: "Crucifix", completed: false },
      { id: 5, label: "Russian Twists", completed: false },
      { id: 6, label: "Biceps", completed: false },
      { id: 7, label: "Shoulders", completed: false },
      { id: 8, label: "Triceps", completed: false },
      { id: 9, label: "Forearms", completed: false },
      { id: 10, label: "Calisthenics", completed: false },
    ],
    []
  );

  const defaultSkinTasks = useMemo(
    () => [
      { id: 1, label: "Body Wash", completed: false },
      { id: 2, label: "Face Wash", completed: false },
      { id: 3, label: "Clean", completed: false },
      { id: 4, label: "Face Serum", completed: false },
      { id: 5, label: "Eye Blow Cleaning", completed: false },
    ],
    []
  );

  const defaultMindSubjects = useMemo(
    () => [
      {
        id: "dsa",
        label: "DSA",
        units: [
          { id: "dsa-u1", label: "U1", completed: false },
          { id: "dsa-u2", label: "U2", completed: false },
          { id: "dsa-u3", label: "U3", completed: false },
          { id: "dsa-u4", label: "U4", completed: false },
        ],
        links: [],
      },
      {
        id: "wt",
        label: "WT",
        units: [
          { id: "wt-u1", label: "U1", completed: false },
          { id: "wt-u2", label: "U2", completed: false },
          { id: "wt-u3", label: "U3", completed: false },
          { id: "wt-u4", label: "U4", completed: false },
        ],
        links: [],
      },
      {
        id: "ddco",
        label: "DDCO",
        units: [
          { id: "ddco-u1", label: "U1", completed: false },
          { id: "ddco-u2", label: "U2", completed: false },
          { id: "ddco-u3", label: "U3", completed: false },
          { id: "ddco-u4", label: "U4", completed: false },
        ],
        links: [],
      },
      {
        id: "mcse",
        label: "MCSE",
        units: [
          { id: "mcse-u1", label: "U1", completed: false },
          { id: "mcse-u2", label: "U2", completed: false },
          { id: "mcse-u3", label: "U3", completed: false },
          { id: "mcse-u4", label: "U4", completed: false },
        ],
        links: [],
      },
      {
        id: "afll",
        label: "AFLL",
        units: [
          { id: "afll-u1", label: "U1", completed: false },
          { id: "afll-u2", label: "U2", completed: false },
          { id: "afll-u3", label: "U3", completed: false },
          { id: "afll-u4", label: "U4", completed: false },
        ],
        links: [],
      },
    ],
    []
  );

  // ---------------------------------
  // View state
  // ---------------------------------
  const [activeView, setActiveView] = useState("none");

  // ---------------------------------
  // BODY: weight + percentage
  // ---------------------------------
  const [inputValue, setInputValue] = useState(() => localStorage.getItem("weightInput") || "");
  const [percentage, setPercentage] = useState(0);

  // ---------------------------------
  // Planner / Tasks view
  // ---------------------------------
  const [plannerTasks, setPlannerTasks] = useState(() => loadJSON("plannerTasks", []));
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [newTaskDueAt, setNewTaskDueAt] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskRemindMins, setNewTaskRemindMins] = useState(30);

  // ---------------------------------
  // BODY tasks checklist
  // ---------------------------------
  const [tasks, setTasks] = useState(() => loadJSON("bodyTasks", defaultBodyTasks));

  // ---------------------------------
  // Progress counters
  // ---------------------------------
  const MAX_SESSIONS = 31;
  const MAX_SKIN_SESSIONS = 31;

  const [progress, setProgress] = useState(() =>
    loadJSON("muscleProgress", {
      biceps: 0,
      shoulders: 0,
      triceps: 0,
      abs: 0,
      forearms: 0,
    })
  );

  // ---------------------------------
  // SKIN
  // ---------------------------------
  const [skinTasks, setSkinTasks] = useState(() => loadJSON("skinTasks", defaultSkinTasks));
  const [skinSessions, setSkinSessions] = useState(() => {
    const saved = localStorage.getItem("skinSessions");
    return saved ? Number(saved) : 0;
  });

  // ---------------------------------
  // MIND
  // ---------------------------------
  const [mindSubjects, setMindSubjects] = useState(() => loadJSON("mindSubjects", defaultMindSubjects));
  const [mindTab, setMindTab] = useState("tasks");
  const [newSubjectName, setNewSubjectName] = useState("");

  const [linkSubjectId, setLinkSubjectId] = useState(() => {
    const first = (loadJSON("mindSubjects", defaultMindSubjects) || [])[0];
    return first?.id || "dsa";
  });

  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  // ---------------------------------
  // Notifications: auto-enable
  // ---------------------------------
  const [notifEnabled] = useState(() => {
    const s = loadJSON("reminderSettings", { enabled: true, skinTime: "21:00", bodyTime: "19:00" });
    return s.enabled !== false;
  });

  useEffect(() => {
    if (!notifEnabled) return;
    if (!("Notification" in window)) return;
    try {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    } catch {}
  }, [notifEnabled]);

  const fireNotify = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
      return;
    }
    // eslint-disable-next-line no-alert
    alert(`${title}\n\n${body}`);
  };

  // ---------------------------------
  // Reminder times: Skin + Body
  // ---------------------------------
  const [skinReminderTime, setSkinReminderTime] = useState(() => {
    const s = loadJSON("reminderSettings", { enabled: true, skinTime: "21:00", bodyTime: "19:00" });
    return s.skinTime || "21:00";
  });

  const [bodyReminderTime, setBodyReminderTime] = useState(() => {
    const s = loadJSON("reminderSettings", { enabled: true, skinTime: "21:00", bodyTime: "19:00" });
    return s.bodyTime || "19:00";
  });

  const [bodyLastReminderDay, setBodyLastReminderDay] = useState(() => localStorage.getItem("bodyLastReminderDay") || "");

  // ---------------------------------
  // Mind reminders (per subject)
  // ---------------------------------
  const [mindReminderTimes, setMindReminderTimes] = useState(() => loadJSON("mindReminderTimes", {}));
  const [mindLastReminderDay, setMindLastReminderDay] = useState(() => loadJSON("mindLastReminderDay", {}));
  const [mindReminderEnabled, setMindReminderEnabled] = useState(() => loadJSON("mindReminderEnabled", {}));

  // Ensure defaults for mind reminder time/enabled when subjects change
  useEffect(() => {
    setMindReminderTimes((prev) => {
      const next = { ...(prev || {}) };
      let changed = false;
      mindSubjects.forEach((s) => {
        if (!next[s.id]) {
          next[s.id] = "20:30";
          changed = true;
        }
      });
      return changed ? next : prev;
    });

    setMindReminderEnabled((prev) => {
      const next = { ...(prev || {}) };
      let changed = false;
      mindSubjects.forEach((s) => {
        if (typeof next[s.id] !== "boolean") {
          next[s.id] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [mindSubjects]);

  // ---------------------------------
  // ✅ SYNC HYDRATION (Backend -> App)
  // ---------------------------------
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      if (SYNC_ENABLED) {
        try {
          const data = await fetchState();

          setPlannerTasks(data.plannerTasks || []);
          setTasks(data.bodyTasks || defaultBodyTasks);
          setSkinTasks(data.skinTasks || defaultSkinTasks);
          setSkinSessions(Number(data.skinSessions || 0));
          setMindSubjects(data.mindSubjects || defaultMindSubjects);

          const rs = data.reminderSettings || { enabled: true, skinTime: "21:00", bodyTime: "19:00" };
          setSkinReminderTime(rs.skinTime || "21:00");
          setBodyReminderTime(rs.bodyTime || "19:00");

          setMindReminderTimes(data.mindReminderTimes || {});
          setMindReminderEnabled(data.mindReminderEnabled || {});
          setMindLastReminderDay(data.mindLastReminderDay || {});

          if (typeof data.weightInput !== "undefined") {
            setInputValue(String(data.weightInput || ""));
            localStorage.setItem("weightInput", String(data.weightInput || ""));
          }
          if (typeof data.muscleProgress !== "undefined") {
            setProgress(data.muscleProgress || progress);
            saveJSON("muscleProgress", data.muscleProgress || progress);
          }

          const first = (data.mindSubjects || defaultMindSubjects || [])[0];
          setLinkSubjectId(first?.id || "dsa");

          setIsHydrated(true);
          return;
        } catch (e) {
          console.error(e);
        }
      }
      setIsHydrated(true);
    };

    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------
  // ✅ SYNC SAVE (Debounced) (App -> Backend)
  // ---------------------------------
  useEffect(() => {
    if (!isHydrated) return;
    if (!SYNC_ENABLED) return;

    const payload = {
      plannerTasks,
      bodyTasks: tasks,
      skinTasks,
      skinSessions,
      mindSubjects,
      reminderSettings: { enabled: true, skinTime: skinReminderTime, bodyTime: bodyReminderTime },
      mindReminderTimes,
      mindReminderEnabled,
      mindLastReminderDay,
      weightInput: inputValue,
      muscleProgress: progress,
    };

    const t = setTimeout(() => {
      saveState(payload).catch((e) => console.error("Save failed:", e));
    }, 500);

    return () => clearTimeout(t);
  }, [
    isHydrated,
    plannerTasks,
    tasks,
    skinTasks,
    skinSessions,
    mindSubjects,
    skinReminderTime,
    bodyReminderTime,
    mindReminderTimes,
    mindReminderEnabled,
    mindLastReminderDay,
    inputValue,
    progress,
  ]);

  // ---------------------------------
  // Local persistence (offline + instant UX)
  // ---------------------------------
  useEffect(() => saveJSON("plannerTasks", plannerTasks), [plannerTasks]);
  useEffect(() => saveJSON("bodyTasks", tasks), [tasks]);
  useEffect(() => saveJSON("skinTasks", skinTasks), [skinTasks]);
  useEffect(() => saveJSON("mindSubjects", mindSubjects), [mindSubjects]);
  useEffect(() => saveJSON("mindReminderTimes", mindReminderTimes || {}), [mindReminderTimes]);
  useEffect(() => saveJSON("mindLastReminderDay", mindLastReminderDay || {}), [mindLastReminderDay]);
  useEffect(() => saveJSON("mindReminderEnabled", mindReminderEnabled || {}), [mindReminderEnabled]);
  useEffect(() => localStorage.setItem("skinSessions", String(skinSessions)), [skinSessions]);
  useEffect(() => localStorage.setItem("bodyLastReminderDay", bodyLastReminderDay), [bodyLastReminderDay]);
  useEffect(() => localStorage.setItem("weightInput", inputValue), [inputValue]);
  useEffect(() => saveJSON("muscleProgress", progress), [progress]);

  useEffect(() => {
    saveJSON("reminderSettings", { enabled: true, skinTime: skinReminderTime, bodyTime: bodyReminderTime });
  }, [skinReminderTime, bodyReminderTime]);

  // ---------------------------------
  // Monthly reset (optional)
  // ---------------------------------
  useEffect(() => {
    const savedMonth = localStorage.getItem("appMonthKey");
    const nowMonth = getMonthKey();

    if (savedMonth !== nowMonth) {
      localStorage.removeItem("muscleProgress");
      localStorage.removeItem("bodyTasks");

      localStorage.removeItem("skinSessions");
      localStorage.removeItem("skinTasks");

      localStorage.setItem("appMonthKey", nowMonth);

      setProgress({ biceps: 0, shoulders: 0, triceps: 0, abs: 0, forearms: 0 });
      setTasks(defaultBodyTasks.map((t) => ({ ...t, completed: false })));
      setSkinTasks(defaultSkinTasks.map((t) => ({ ...t, completed: false })));
      setSkinSessions(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------
  // util
  // ---------------------------------
  function hexToRgba(color, alpha) {
    if (color.startsWith("rgb")) {
      const nums = color
        .replace(/rgba?\(/, "")
        .replace(")", "")
        .split(",")
        .map((n) => parseFloat(n.trim()));
      const [r, g, b] = nums;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    let c = color.replace("#", "");
    if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const getRingColor = (val) => {
    const v = Number(val) || 0;
    let ringColor = "#ff4d4d";
    if (v > 80) ringColor = "#00eaff";
    else if (v > 50) ringColor = "#00ff66";
    else if (v > 20) ringColor = "#ffd700";
    return ringColor;
  };

  const GlowCircle = ({ value, ringColor, textColor = "#bffcff", barSize = 200 }) => {
    const wrapperStyle = {
      width: `${barSize}px`,
      height: `${barSize}px`,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `radial-gradient(circle at 50% 50%, ${hexToRgba(ringColor, 0.18)} 0%, rgba(0,0,0,0) 70%)`,
      boxShadow: `
        0 0 20px  ${hexToRgba(ringColor, 1)},
        0 0 60px  ${hexToRgba(ringColor, 0.8)},
        0 0 120px ${hexToRgba(ringColor, 0.5)},
        0 0 200px ${hexToRgba(ringColor, 0.25)}
      `,
    };

    return (
      <div style={wrapperStyle} className="glow-circle">
        <div style={{ width: `${barSize}px`, height: `${barSize}px` }}>
          <CircularProgressbar
            value={value}
            text={`${Math.round(value)}%`}
            styles={buildStyles({
              textColor,
              pathColor: ringColor,
              trailColor: "rgba(0,0,0,0.4)",
              textSize: "18px",
              pathTransitionDuration: 0.6,
            })}
          />
        </div>
      </div>
    );
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 54,
        height: 30,
        borderRadius: 999,
        border: "1px solid rgba(0,255,255,0.35)",
        background: checked ? "rgba(0,255,200,0.25)" : "rgba(0,30,60,0.35)",
        position: "relative",
        cursor: "pointer",
        boxShadow: checked ? "0 0 14px rgba(0,255,200,0.35)" : "none",
        outline: "none",
        userSelect: "none",
      }}
      aria-pressed={checked}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 27 : 3,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: checked ? "rgba(0,255,200,0.9)" : "rgba(0,255,255,0.6)",
          boxShadow: checked ? "0 0 16px rgba(0,255,200,0.65)" : "0 0 12px rgba(0,255,255,0.35)",
          transition: "left 160ms ease",
        }}
      />
    </button>
  );

  // ---------------------------------
  // BODY: weight -> percentage
  // ---------------------------------
  useEffect(() => {
    const x = parseFloat(inputValue);
    if (!isNaN(x)) {
      let y = -2.5 * (x - 100);
      y = Math.max(0, Math.min(100, y));
      setPercentage(y);
    } else {
      setPercentage(0);
    }
  }, [inputValue]);

  const handleChange = (e) => setInputValue(e.target.value);

  // ---------------------------------
  // ✅ DAILY RESET at 00:00 IST (Body + Mind + Skin)
  // ---------------------------------
  const prevAllCompletedRef = useRef(false);

  useEffect(() => {
    const resetIfNewISTDay = () => {
      const todayIST = getISTDayKey();

      const savedSkinDay = localStorage.getItem("skinDayKey_IST");
      if (savedSkinDay !== todayIST) {
        setSkinTasks((prev) => prev.map((t) => ({ ...t, completed: false })));
        prevAllCompletedRef.current = false;
        localStorage.setItem("skinDayKey_IST", todayIST);
        localStorage.removeItem("skinLastReminderDay");
      }

      const savedBodyDay = localStorage.getItem("bodyDayKey_IST");
      if (savedBodyDay !== todayIST) {
        setTasks((prev) => prev.map((t) => ({ ...t, completed: false })));
        localStorage.setItem("bodyDayKey_IST", todayIST);
        localStorage.removeItem("bodyLastReminderDay");
        setBodyLastReminderDay("");
      }

      const savedMindDay = localStorage.getItem("mindDayKey_IST");
      if (savedMindDay !== todayIST) {
        setMindSubjects((prev) =>
          prev.map((s) => ({
            ...s,
            units: (s.units || []).map((u) => ({ ...u, completed: false })),
          }))
        );
        localStorage.setItem("mindDayKey_IST", todayIST);
      }
    };

    resetIfNewISTDay();
    const timer = setInterval(resetIfNewISTDay, 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const allCompleted = skinTasks.every((t) => t.completed);
    if (allCompleted && !prevAllCompletedRef.current) {
      setSkinSessions((s) => Math.min(s + 1, MAX_SKIN_SESSIONS));
      fireNotify("✅ Skin Session Completed", "Nice! Your skin routine session has been recorded.");
    }
    prevAllCompletedRef.current = allCompleted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skinTasks]);

  // ---------------------------------
  // Notification engine (IST time-based reminders)
  // ---------------------------------
  useEffect(() => {
    if (!notifEnabled) return;

    const tick = () => {
      const now = Date.now();

      setPlannerTasks((prev) => {
        let changed = false;
        const next = prev.map((t) => {
          if (t.completed || t.notified || !t.remindAt) return t;
          const remindTime = new Date(t.remindAt).getTime();
          if (remindTime <= now) {
            fireNotify(
              `⏰ Task Reminder (${t.priority})`,
              `${t.label}${t.dueAt ? ` (Due: ${new Date(t.dueAt).toLocaleString()})` : ""}`
            );
            changed = true;
            return { ...t, notified: true };
          }
          return t;
        });
        return changed ? next : prev;
      });

      const nowMinutesIST = getISTNowMinutes();
      const todayIST = getISTDayKey();

      const [shh, smm] = String(skinReminderTime || "21:00")
        .split(":")
        .map((x) => parseInt(x, 10));
      if (Number.isFinite(shh) && Number.isFinite(smm)) {
        const target = shh * 60 + smm;
        const lastDay = localStorage.getItem("skinLastReminderDay");
        const incomplete = skinTasks.some((t) => !t.completed);

        if (incomplete && nowMinutesIST >= target && nowMinutesIST <= target + 2) {
          if (lastDay !== todayIST) {
            fireNotify("🧴 Skin Routine Reminder", "Finish your skin tasks to complete today’s session.");
            localStorage.setItem("skinLastReminderDay", todayIST);
          }
        }
      }

      const [bhh, bmm] = String(bodyReminderTime || "19:00")
        .split(":")
        .map((x) => parseInt(x, 10));
      if (Number.isFinite(bhh) && Number.isFinite(bmm)) {
        const target = bhh * 60 + bmm;
        const incomplete = tasks.some((t) => !t.completed);

        if (incomplete && nowMinutesIST >= target && nowMinutesIST <= target + 2) {
          if (bodyLastReminderDay !== todayIST) {
            fireNotify("🏋️ Body Tasks Reminder", "You still have body tasks incomplete today. Finish them to progress!");
            setBodyLastReminderDay(todayIST);
          }
        }
      }

      const times = mindReminderTimes || {};
      const enabledMap = mindReminderEnabled || {};
      const lastMap = mindLastReminderDay || {};
      const updates = {};

      mindSubjects.forEach((subj) => {
        if (!enabledMap[subj.id]) return;
        const units = subj.units || [];
        if (units.length === 0) return;

        const incomplete = units.some((u) => !u.completed);
        if (!incomplete) return;

        const timeStr = times[subj.id] || "20:30";
        const [mhh, mmm] = String(timeStr)
          .split(":")
          .map((x) => parseInt(x, 10));
        if (!Number.isFinite(mhh) || !Number.isFinite(mmm)) return;

        const target = mhh * 60 + mmm;
        const lastSent = lastMap[subj.id] || "";

        if (nowMinutesIST >= target && nowMinutesIST <= target + 2) {
          if (lastSent !== todayIST) {
            fireNotify(`📚 ${subj.label} Reminder`, `You have incomplete units in ${subj.label}. Finish your tasks today!`);
            updates[subj.id] = todayIST;
          }
        }
      });

      if (Object.keys(updates).length > 0) {
        setMindLastReminderDay((prev) => ({ ...(prev || {}), ...updates }));
      }
    };

    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, [
    notifEnabled,
    skinReminderTime,
    bodyReminderTime,
    skinTasks,
    tasks,
    bodyLastReminderDay,
    mindSubjects,
    mindReminderTimes,
    mindReminderEnabled,
    mindLastReminderDay,
  ]);

  // ---------------------------------
  // BODY toggleTask (progress counter)
  // ---------------------------------
  const toggleTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const nowCompleted = !task.completed;
    const label = (task.label || "").toLowerCase();
    const absExercises = ["crunches", "crucifix", "russian twists"];

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: nowCompleted } : t)));

    if (nowCompleted) {
      setProgress((prev) => {
        const next = { ...prev };
        if (label.includes("bicep")) next.biceps = Math.min(next.biceps + 1, MAX_SESSIONS);
        else if (label.includes("shoulder")) next.shoulders = Math.min(next.shoulders + 1, MAX_SESSIONS);
        else if (label.includes("forearm")) next.forearms = Math.min(next.forearms + 1, MAX_SESSIONS);
        else if (label.includes("tricep")) next.triceps = Math.min(next.triceps + 1, MAX_SESSIONS);
        if (absExercises.includes(label)) next.abs = Math.min(next.abs + 1, MAX_SESSIONS);
        return next;
      });
    }
  };

  // ---------------------------------
  // Linear progress bar
  // ---------------------------------
  const LinearBar = ({ label, value, max }) => {
    const percent = max ? (value / max) * 100 : value;

    let color = "#ff4d4d";
    if (percent > 80) color = "#00eaff";
    else if (percent > 50) color = "#00ff66";
    else if (percent > 20) color = "#ffd700";

    const isFull = percent >= 100;

    return (
      <div style={{ margin: "10px 0" }}>
        <span style={{ color: "#bffcff", fontSize: "16px" }}>
          {max ? `${label} (${value}/${max})` : label}
        </span>
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            height: "10px",
            borderRadius: "10px",
            overflow: "hidden",
            marginTop: "5px",
            boxShadow: "0 0 6px rgba(0, 255, 255, 0.3)",
          }}
        >
          <div
            className={isFull ? "pulse-bar" : ""}
            style={{
              width: `${percent}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${color}, cyan)`,
              transition: "width 0.5s ease, background 0.5s ease",
              boxShadow: `0 0 8px ${color}`,
            }}
          />
        </div>
      </div>
    );
  };

  // ---------------------------------
  // SKIN toggle
  // ---------------------------------
  const toggleSkinTask = (id) => {
    setSkinTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  // ---------------------------------
  // Planner helpers
  // ---------------------------------
  const deletePlannerTask = (id) => setPlannerTasks((prev) => prev.filter((t) => t.id !== id));
  const togglePlannerTask = (id) => setPlannerTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const addPlannerTask = () => {
    const label = newTaskLabel.trim();
    if (!label) return;

    const dueAt = newTaskDueAt ? new Date(newTaskDueAt).toISOString() : null;
    const remindAt =
      dueAt && newTaskRemindMins != null
        ? new Date(new Date(dueAt).getTime() - Number(newTaskRemindMins) * 60000).toISOString()
        : null;

    const task = {
      id: Date.now(),
      label,
      completed: false,
      dueAt,
      priority: newTaskPriority,
      remindAt,
      notified: false,
      createdAt: new Date().toISOString(),
    };

    setPlannerTasks((prev) => [task, ...prev]);
    setNewTaskLabel("");
    setNewTaskDueAt("");
    setNewTaskPriority("medium");
    setNewTaskRemindMins(30);
  };

  // ---------------------------------
  // MIND: toggle unit
  // ---------------------------------
  const toggleMindUnit = (subjectId, unitId) => {
    setMindSubjects((prev) =>
      prev.map((subj) =>
        subj.id !== subjectId
          ? subj
          : { ...subj, units: subj.units.map((u) => (u.id === unitId ? { ...u, completed: !u.completed } : u)) }
      )
    );
  };

  const getSubjectPercent = (subjectId) => {
    const subj = mindSubjects.find((s) => s.id === subjectId);
    if (!subj || !subj.units?.length) return 0;
    const completed = subj.units.filter((u) => u.completed).length;
    return (completed / subj.units.length) * 100;
  };

  const mindTotals = useMemo(() => {
    const totalUnits = mindSubjects.reduce((sum, s) => sum + (s.units?.length || 0), 0);
    const completedUnits = mindSubjects.reduce((sum, s) => sum + (s.units?.filter((u) => u.completed).length || 0), 0);
    return { totalUnits, completedUnits, percent: totalUnits === 0 ? 0 : (completedUnits / totalUnits) * 100 };
  }, [mindSubjects]);

  const addMindSubject = () => {
    const name = newSubjectName.trim();
    if (!name) return;

    const id = `sub-${Date.now()}`;
    setMindSubjects((prev) => [
      ...prev,
      {
        id,
        label: name,
        units: [
          { id: `${id}-u1`, label: "U1", completed: false },
          { id: `${id}-u2`, label: "U2", completed: false },
          { id: `${id}-u3`, label: "U3", completed: false },
          { id: `${id}-u4`, label: "U4", completed: false },
        ],
        links: [],
      },
    ]);

    setNewSubjectName("");
    setLinkSubjectId(id);
    setMindReminderTimes((prev) => ({ ...(prev || {}), [id]: "20:30" }));
    setMindReminderEnabled((prev) => ({ ...(prev || {}), [id]: true }));
  };

  const deleteMindSubject = (subjectId) => {
    const ok = window.confirm("Delete this subject? This will remove its units and saved links.");
    if (!ok) return;

    setMindSubjects((prev) => {
      const next = prev.filter((s) => s.id !== subjectId);

      if (linkSubjectId === subjectId) {
        setLinkSubjectId(next[0]?.id || "");
      } else if (next.length === 0) {
        setLinkSubjectId("");
      }

      setMindReminderTimes((prevTimes) => {
        const copy = { ...(prevTimes || {}) };
        delete copy[subjectId];
        return copy;
      });
      setMindLastReminderDay((prevDays) => {
        const copy = { ...(prevDays || {}) };
        delete copy[subjectId];
        return copy;
      });
      setMindReminderEnabled((prevEn) => {
        const copy = { ...(prevEn || {}) };
        delete copy[subjectId];
        return copy;
      });

      return next;
    });
  };

  const addSubjectLink = () => {
    const title = newLinkTitle.trim();
    const url = newLinkUrl.trim();
    if (!title || !url) return;
    if (!linkSubjectId) return;

    setMindSubjects((prev) =>
      prev.map((s) => (s.id !== linkSubjectId ? s : { ...s, links: [...(s.links || []), { id: Date.now(), title, url }] }))
    );

    setNewLinkTitle("");
    setNewLinkUrl("");
  };

  const removeSubjectLink = (subjectId, linkId) => {
    setMindSubjects((prev) =>
      prev.map((s) => (s.id !== subjectId ? s : { ...s, links: (s.links || []).filter((l) => l.id !== linkId) }))
    );
  };

  const setSubjectReminderTime = (subjectId, time) =>
    setMindReminderTimes((prev) => ({ ...(prev || {}), [subjectId]: time }));

  const setSubjectReminderEnabled = (subjectId, enabled) =>
    setMindReminderEnabled((prev) => ({ ...(prev || {}), [subjectId]: !!enabled }));

  // ---------------------------------
  // Derived percentages
  // ---------------------------------
  const completedCount = tasks.filter((t) => t.completed).length;
  const secondPercentage = tasks.length === 0 ? 0 : (completedCount / tasks.length) * 100;

  const skinPercent = useMemo(() => {
    const done = skinTasks.filter((t) => t.completed).length;
    return skinTasks.length === 0 ? 0 : (done / skinTasks.length) * 100;
  }, [skinTasks]);

  // ---------------------------------
  // ✅ Styles: center everything + keep same interface
  // ---------------------------------
  const containerStyle = {
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    position: "relative",
    backgroundColor: "#00093eff",
    backgroundImage: `url(${myphoto})`,
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // This is the centered “stage” that fixes the left-shift issue.
  const stageStyle = {
    position: "relative",
    width: `${stageW}px`,
    height: `${stageH}px`,
  };

  const buttonStyle = {
    position: "absolute",
    width: "20px",
    height: "20px",
    minWidth: "0",
    minHeight: "0",
    padding: "0",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "50%",
    fontSize: "16px",
    lineHeight: "1",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  };

  // Cards are pinned left/right inside the stage (always centered as a group)
  const leftCardBox = {
    position: "absolute",
    left: 0,
    top: `${cardTop}px`,
    width: `${cardW}px`,
    height: `${cardH}px`,
  };

  const rightCardBox = {
    position: "absolute",
    right: 0,
    top: `${cardTop}px`,
    width: `${cardW}px`,
    height: `${cardH}px`,
  };

  // Optional: show a gentle hint in portrait (still keeps UI, but landscape is best)
  const showRotateHint = !isLandscape && VW < 900;

  // ---------------------------------
  // Render
  // ---------------------------------
  return (
    <div style={containerStyle}>
      <div style={stageStyle}>
        {showRotateHint && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(0,255,255,0.25)",
              background: "rgba(0, 20, 50, 0.35)",
              color: "#bffcff",
              fontSize: 12,
              zIndex: 10,
              boxShadow: "0 0 12px rgba(0,255,255,0.15)",
              pointerEvents: "none",
            }}
          >
            Rotate to landscape for best layout ✨
          </div>
        )}

        {/* --- BUTTONS (relative to centered stage) --- */}
        <button
          className="glow-btn"
          style={{ ...buttonStyle, top: "20%", left: "49.3%" }}
          onClick={() => setActiveView("Mind")}
          title="Mind"
        />
        <button
          className="glow-btn"
          style={{ ...buttonStyle, top: "35%", left: "49.3%" }}
          onClick={() => setActiveView("Skin")}
          title="Skin"
        />
        <button
          className="glow-btn"
          style={{ ...buttonStyle, top: "45%", left: "49.3%" }}
          onClick={() => setActiveView("Body")}
          title="Body"
        />
        <button
          className="glow-btn"
          style={{ ...buttonStyle, bottom: "6%", right: "49.3%" }}
          onClick={() => setActiveView("Tasks")}
          title="Tasks"
        />

        {/* --- BODY VIEW --- */}
        {activeView === "Body" && (
          <>
            <div className="task-card left-card" style={leftCardBox}>
              {/* rings centered */}
              <div style={{ position: "absolute", top: `${bodyRingTop}px`, left: `${ringStartX}px` }}>
                <GlowCircle value={percentage} ringColor="rgb(0,255,255)" textColor="#bffcff" barSize={RING_BIG} />
              </div>

              <div style={{ position: "absolute", top: `${bodyRingTop}px`, left: `${ringStartX + RING_BIG + bodyRingGap}px` }}>
                <GlowCircle value={secondPercentage} ringColor="#fff2a8" textColor="#fff2cc" barSize={RING_BIG} />
              </div>

              <div style={{ position: "absolute", top: `${bodyRingTop + RING_BIG + 20}px`, left: "18px", width: "calc(100% - 36px)" }}>
                <h3 style={{ color: "#bffcff", textAlign: "center" }}>Muscle Progress</h3>
                <LinearBar label="💪 Biceps" value={progress.biceps} max={MAX_SESSIONS} />
                <LinearBar label="🏋️ Shoulders" value={progress.shoulders} max={MAX_SESSIONS} />
                <LinearBar label="🤜 Triceps" value={progress.triceps} max={MAX_SESSIONS} />
                <LinearBar label="🧘 Abs" value={progress.abs} max={MAX_SESSIONS} />
                <LinearBar label="✋ Forearms" value={progress.forearms} max={MAX_SESSIONS} />

                <div style={{ marginTop: 16, textAlign: "center" }}>
                  <div style={{ color: "#bffcff", marginBottom: 8 }}>Body reminder time</div>
                  <input
                    type="time"
                    value={bodyReminderTime}
                    onChange={(e) => setBodyReminderTime(e.target.value)}
                    className="input-glow"
                    style={{ width: 160 }}
                  />
                </div>
              </div>
            </div>

            <div className="task-card right-card" style={rightCardBox}>
              <div className="panel-inner">
                <div style={{ textAlign: "center" }}>
                  <label htmlFor="xValue" style={{ color: "#bffcff", fontSize: "20px", fontWeight: "400" }}>
                    Weight:
                  </label>
                  <input id="xValue" type="number" value={inputValue} onChange={handleChange} className="input-glow" />
                </div>

                <div className="panel-scroll" style={{ marginTop: 18 }}>
                  <h2 style={{ color: "#bffcff", textAlign: "center" }}>Daily Tasks</h2>

                  {tasks.map((task) => (
                    <label
                      key={task.id}
                      style={{
                        display: "block",
                        margin: "8px 0",
                        color: task.completed ? "#00ffcc" : "#bffcff",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        style={{ marginRight: "10px", transform: "scale(1.2)", cursor: "pointer" }}
                      />
                      {task.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* --- MIND VIEW --- */}
        {activeView === "Mind" && (
          <>
            <div className="task-card left-card" style={leftCardBox}>
              <div style={{ position: "absolute", top: `${mindTotalTop}px`, left: `${mindTotalLeft}px` }}>
                <GlowCircle value={mindTotals.percent} ringColor={getRingColor(mindTotals.percent)} textColor="#bffcff" barSize={RING_BIG} />
              </div>

              <div
                style={{
                  position: "absolute",
                  top: `${mindTotalTop + RING_BIG + 18}px`,
                  left: "18px",
                  width: "calc(100% - 36px)",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "18px",
                  justifyContent: "center",
                }}
              >
                {mindSubjects.map((s) => {
                  const val = getSubjectPercent(s.id);
                  const ring = getRingColor(val);
                  return (
                    <div key={s.id} style={{ textAlign: "center" }}>
                      <GlowCircle value={val} ringColor={ring} textColor="#bffcff" barSize={RING_MID} />
                      <div style={{ marginTop: "10px", color: "#bffcff", fontSize: "14px" }}>{s.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="task-card right-card" style={rightCardBox}>
              <div className="panel-inner">
                <h2 style={{ color: "#bffcff", textAlign: "center", marginBottom: "10px", fontSize: MIND_HEADER_FONT_SIZE }}>
                  Mind
                </h2>

                {/* Add Subject */}
                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 12 }}>
                  <input
                    type="text"
                    className="input-glow"
                    placeholder="New subject name..."
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    style={{ width: "60%", maxWidth: 240 }}
                  />
                  <button
                    onClick={addMindSubject}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "999px",
                      border: "none",
                      cursor: "pointer",
                      background: "linear-gradient(90deg, rgba(0,255,255,0.9), rgba(0,180,255,0.9))",
                      color: "#001327",
                      boxShadow: "0 0 18px rgba(0,255,255,0.8)",
                    }}
                  >
                    Add
                  </button>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 12 }}>
                  <button
                    onClick={() => setMindTab("tasks")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "999px",
                      border: "none",
                      cursor: "pointer",
                      background:
                        mindTab === "tasks"
                          ? "linear-gradient(90deg, rgba(0,255,255,0.9), rgba(0,180,255,0.9))"
                          : "rgba(0, 30, 60, 0.35)",
                      color: mindTab === "tasks" ? "#001327" : "#bffcff",
                      boxShadow: mindTab === "tasks" ? "0 0 14px rgba(0,255,255,0.7)" : "none",
                    }}
                  >
                    Tasks
                  </button>
                  <button
                    onClick={() => setMindTab("links")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "999px",
                      border: "none",
                      cursor: "pointer",
                      background:
                        mindTab === "links"
                          ? "linear-gradient(90deg, rgba(0,255,255,0.9), rgba(0,180,255,0.9))"
                          : "rgba(0, 30, 60, 0.35)",
                      color: mindTab === "links" ? "#001327" : "#bffcff",
                      boxShadow: mindTab === "links" ? "0 0 14px rgba(0,255,255,0.7)" : "none",
                    }}
                  >
                    Links
                  </button>
                </div>

                <div className="panel-scroll">
                  {/* TASKS TAB */}
                  {mindTab === "tasks" && (
                    <>
                      {mindSubjects.length === 0 ? (
                        <p style={{ color: "#bffcff" }}>No subjects yet. Add one above.</p>
                      ) : (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(auto-fit, minmax(${Math.floor(clamp(cardW * 0.54, 250, 320))}px, 1fr))`,
                            gap: 16,
                            alignItems: "start",
                          }}
                        >
                          {mindSubjects.map((subject) => {
                            const enabled = !!mindReminderEnabled?.[subject.id];

                            return (
                              <div
                                key={subject.id}
                                style={{
                                  borderRadius: 18,
                                  border: "1px solid rgba(0,255,255,0.22)",
                                  background: "rgba(0, 20, 50, 0.28)",
                                  boxShadow: "0 0 14px rgba(0, 191, 255, 0.14)",
                                  padding: 16,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    marginBottom: 12,
                                  }}
                                >
                                  <div style={{ color: "#bffcff", fontWeight: 900, fontSize: 20, letterSpacing: 0.4 }}>
                                    {subject.label}
                                  </div>

                                  <button
                                    onClick={() => deleteMindSubject(subject.id)}
                                    style={{
                                      padding: "7px 12px",
                                      borderRadius: 999,
                                      border: "none",
                                      cursor: "pointer",
                                      background: "rgba(255, 77, 77, 0.92)",
                                      color: "#001327",
                                      boxShadow: "0 0 12px rgba(255, 77, 77, 0.55)",
                                      fontSize: 12,
                                      fontWeight: 800,
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>

                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "minmax(0, 1fr) auto",
                                    columnGap: 12,
                                    rowGap: 8,
                                    alignItems: "center",
                                    marginBottom: 12,
                                  }}
                                >
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ color: "#bffcff", fontSize: 12, opacity: 0.9, marginBottom: 6 }}>
                                      Reminder time
                                    </div>

                                    <input
                                      type="time"
                                      value={mindReminderTimes?.[subject.id] || "20:30"}
                                      onChange={(e) => setSubjectReminderTime(subject.id, e.target.value)}
                                      className="input-glow"
                                      style={{
                                        width: "100%",
                                        maxWidth: 170,
                                        minWidth: 0,
                                        opacity: enabled ? 1 : 0.45,
                                        pointerEvents: enabled ? "auto" : "none",
                                      }}
                                    />
                                  </div>

                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                                    <div
                                      style={{
                                        color: enabled ? "#00ffcc" : "#bffcff",
                                        fontSize: 12,
                                        fontWeight: 800,
                                        opacity: 0.95,
                                      }}
                                    >
                                      {enabled ? "ON" : "OFF"}
                                    </div>

                                    <ToggleSwitch checked={enabled} onChange={(val) => setSubjectReminderEnabled(subject.id, val)} />
                                  </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                                  {(subject.units || []).map((unit) => (
                                    <label
                                      key={unit.id}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: `10px 10px`,
                                        borderRadius: 14,
                                        background: "rgba(0, 30, 60, 0.22)",
                                        border: "1px solid rgba(0,255,255,0.12)",
                                        color: unit.completed ? "#00ffcc" : "#bffcff",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={unit.completed}
                                        onChange={() => toggleMindUnit(subject.id, unit.id)}
                                        style={{ transform: "scale(1.1)", cursor: "pointer" }}
                                      />
                                      <span style={{ fontWeight: 800, fontSize: 16 }}>{unit.label}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {/* LINKS TAB */}
                  {mindTab === "links" && (
                    <>
                      {mindSubjects.length === 0 ? (
                        <p style={{ color: "#bffcff" }}>No subjects yet. Add a subject first.</p>
                      ) : (
                        <>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <span style={{ color: "#bffcff" }}>Subject:</span>
                            <select
                              value={linkSubjectId || mindSubjects[0]?.id || ""}
                              onChange={(e) => setLinkSubjectId(e.target.value)}
                              style={{
                                flex: 1,
                                padding: "10px 12px",
                                borderRadius: 10,
                                border: "1.5px solid rgba(0, 191, 255, 0.7)",
                                background: "rgba(0, 30, 60, 0.3)",
                                color: "#bffcff",
                                outline: "none",
                              }}
                            >
                              {mindSubjects.map((s) => (
                                <option key={s.id} value={s.id} style={{ background: "#001327" }}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                            <input
                              type="text"
                              className="input-glow"
                              placeholder="Link title..."
                              value={newLinkTitle}
                              onChange={(e) => setNewLinkTitle(e.target.value)}
                              style={{ width: "100%", maxWidth: "100%" }}
                            />
                            <input
                              type="url"
                              className="input-glow"
                              placeholder="https://..."
                              value={newLinkUrl}
                              onChange={(e) => setNewLinkUrl(e.target.value)}
                              style={{ width: "100%", maxWidth: "100%" }}
                            />
                            <button
                              onClick={addSubjectLink}
                              style={{
                                marginTop: 4,
                                padding: "10px 26px",
                                borderRadius: "999px",
                                border: "none",
                                fontSize: "16px",
                                cursor: "pointer",
                                background: "linear-gradient(90deg, rgba(0,255,255,0.9), rgba(0,180,255,0.9))",
                                color: "#001327",
                                boxShadow: "0 0 18px rgba(0,255,255,0.8)",
                                alignSelf: "center",
                              }}
                            >
                              Add Link
                            </button>
                          </div>

                          <div style={{ marginTop: 16 }}>
                            <h3 style={{ color: "#bffcff", marginBottom: 10 }}>Saved Links</h3>

                            {(() => {
                              const activeId = linkSubjectId || mindSubjects[0]?.id;
                              const subj = mindSubjects.find((s) => s.id === activeId);
                              const links = subj?.links || [];

                              if (links.length === 0) return <p style={{ color: "#bffcff" }}>No links yet. Add one above.</p>;

                              return links.map((l) => (
                                <div
                                  key={l.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 10,
                                    padding: "10px 12px",
                                    marginBottom: 10,
                                    borderRadius: 12,
                                    border: "1px solid rgba(0,255,255,0.35)",
                                    background: "rgba(0, 20, 50, 0.25)",
                                    boxShadow: "0 0 10px rgba(0, 191, 255, 0.2)",
                                  }}
                                >
                                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <span style={{ color: "#bffcff", fontWeight: 600 }}>{l.title}</span>
                                    <a href={l.url} target="_blank" rel="noreferrer" style={{ color: "#00f0ff", fontSize: 13 }}>
                                      {l.url}
                                    </a>
                                  </div>

                                  <button
                                    onClick={() => removeSubjectLink(activeId, l.id)}
                                    style={{
                                      padding: "8px 12px",
                                      borderRadius: 999,
                                      border: "none",
                                      cursor: "pointer",
                                      background: "rgba(255, 77, 77, 0.9)",
                                      color: "#001327",
                                      boxShadow: "0 0 12px rgba(255, 77, 77, 0.6)",
                                    }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              ));
                            })()}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                <div style={{ marginTop: 10, textAlign: "center", fontSize: 12, opacity: 0.85, color: "#bffcff" }}>
                  Sync: {SYNC_ENABLED ? (isHydrated ? "✅ connected" : "⏳ loading...") : "⚠️ disabled (set VITE_API_BASE)"}
                </div>
              </div>
            </div>
          </>
        )}

        {/* --- SKIN VIEW --- */}
        {activeView === "Skin" && (
          <>
            <div className="task-card left-card" style={leftCardBox}>
              <div style={{ position: "absolute", top: `${skinRingTop}px`, left: `${skinRingLeft}px` }}>
                <GlowCircle value={skinPercent} ringColor="rgb(0,255,255)" textColor="#bffcff" barSize={RING_BIG} />
              </div>

              <div style={{ position: "absolute", top: `${skinRingTop + RING_BIG + 22}px`, left: "18px", width: "calc(100% - 36px)" }}>
                <h3 style={{ color: "#bffcff", textAlign: "center" }}>Skin Routine Progress</h3>
                <LinearBar label="🧴 Skin Sessions" value={skinSessions} max={MAX_SKIN_SESSIONS} />

                <div style={{ marginTop: 18, textAlign: "center" }}>
                  <div style={{ color: "#bffcff", marginBottom: 8 }}>Daily reminder time</div>
                  <input
                    type="time"
                    value={skinReminderTime}
                    onChange={(e) => setSkinReminderTime(e.target.value)}
                    className="input-glow"
                    style={{ width: 160 }}
                  />
                </div>
              </div>
            </div>

            <div className="task-card right-card" style={rightCardBox}>
              <div className="panel-inner">
                <h2 style={{ color: "#bffcff", textAlign: "center", marginBottom: 10 }}>Tasks:</h2>

                <div className="panel-scroll">
                  {skinTasks.map((task) => (
                    <label
                      key={task.id}
                      style={{
                        display: "block",
                        margin: "8px 0",
                        color: task.completed ? "#00ffcc" : "#bffcff",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleSkinTask(task.id)}
                        style={{ marginRight: "10px", transform: "scale(1.2)", cursor: "pointer" }}
                      />
                      {task.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* --- TASKS VIEW --- */}
        {activeView === "Tasks" && (
          <>
            <div className="task-card left-card" style={leftCardBox}>
              <div className="panel-inner">
                <h2 style={{ color: "#bffcff", textAlign: "center", marginBottom: "14px" }}>Your Tasks</h2>

                <div className="panel-scroll" style={{ paddingBottom: 140 }}>
                  {plannerTasks.length === 0 ? (
                    <p style={{ color: "#bffcff", textAlign: "center" }}>No tasks yet. Add one on the right.</p>
                  ) : (
                    plannerTasks.map((task) => {
                      const dueText = task.dueAt ? new Date(task.dueAt).toLocaleString() : "No due date";
                      return (
                        <div
                          key={task.id}
                          style={{
                            borderRadius: 14,
                            border: "1px solid rgba(0,255,255,0.25)",
                            background: "rgba(0, 20, 50, 0.18)",
                            padding: "10px 12px",
                            marginBottom: 10,
                            boxShadow: "0 0 10px rgba(0, 191, 255, 0.15)",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              gap: 10,
                              alignItems: "flex-start",
                              color: task.completed ? "#00ffcc" : "#bffcff",
                              cursor: "pointer",
                              flex: 1,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => togglePlannerTask(task.id)}
                              style={{ marginTop: 4, transform: "scale(1.2)", cursor: "pointer" }}
                            />
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <div style={{ fontWeight: 700 }}>{task.label}</div>
                              <div style={{ fontSize: 12, opacity: 0.9 }}>
                                Due: <span style={{ color: "#00f0ff" }}>{dueText}</span>
                              </div>
                              <div style={{ fontSize: 12, opacity: 0.9 }}>
                                Priority:{" "}
                                <span style={{ color: "#00f0ff", fontWeight: 700 }}>
                                  {String(task.priority || "medium").toUpperCase()}
                                </span>
                                {task.remindAt && (
                                  <>
                                    {" "}
                                    • Remind:{" "}
                                    <span style={{ color: "#00f0ff" }}>{new Date(task.remindAt).toLocaleString()}</span>
                                  </>
                                )}
                                {task.notified && <span style={{ marginLeft: 8, color: "#ffd700" }}>🔔 sent</span>}
                              </div>
                            </div>
                          </label>

                          <button
                            onClick={() => deletePlannerTask(task.id)}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 999,
                              border: "none",
                              cursor: "pointer",
                              background: "rgba(255, 77, 77, 0.9)",
                              color: "#001327",
                              boxShadow: "0 0 12px rgba(255, 77, 77, 0.6)",
                              marginTop: 2,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="task-card right-card" style={rightCardBox}>
              <div className="panel-inner" style={{ alignItems: "center" }}>
                <h2 style={{ color: "#bffcff", marginBottom: "16px", textAlign: "center" }}>Add Task</h2>

                <input
                  type="text"
                  className="input-glow"
                  placeholder="New task..."
                  value={newTaskLabel}
                  onChange={(e) => setNewTaskLabel(e.target.value)}
                  style={{ width: "80%", maxWidth: "320px" }}
                />

                <div style={{ marginTop: 14, width: "100%", textAlign: "center" }}>
                  <div style={{ color: "#bffcff", marginBottom: 8 }}>Due date & time</div>
                  <input
                    type="datetime-local"
                    value={newTaskDueAt}
                    onChange={(e) => setNewTaskDueAt(e.target.value)}
                    className="input-glow"
                    style={{ width: "80%", maxWidth: "320px" }}
                  />
                </div>

                <div style={{ marginTop: 14, width: "100%", textAlign: "center" }}>
                  <div style={{ color: "#bffcff", marginBottom: 8 }}>Priority</div>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    style={{
                      width: "80%",
                      maxWidth: 320,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1.5px solid rgba(0, 191, 255, 0.7)",
                      background: "rgba(0, 30, 60, 0.3)",
                      color: "#bffcff",
                      outline: "none",
                    }}
                  >
                    <option value="low" style={{ background: "#001327" }}>
                      Low
                    </option>
                    <option value="medium" style={{ background: "#001327" }}>
                      Medium
                    </option>
                    <option value="high" style={{ background: "#001327" }}>
                      High
                    </option>
                  </select>
                </div>

                <div style={{ marginTop: 14, width: "100%", textAlign: "center" }}>
                  <div style={{ color: "#bffcff", marginBottom: 8 }}>Remind before (minutes)</div>
                  <input
                    type="number"
                    min="0"
                    value={newTaskRemindMins}
                    onChange={(e) => setNewTaskRemindMins(e.target.value)}
                    className="input-glow"
                    style={{ width: "120px" }}
                  />
                </div>

                <button
                  onClick={addPlannerTask}
                  style={{
                    marginTop: "18px",
                    padding: "10px 26px",
                    borderRadius: "999px",
                    border: "none",
                    fontSize: "16px",
                    cursor: "pointer",
                    background: "linear-gradient(90deg, rgba(0,255,255,0.9), rgba(0,180,255,0.9))",
                    color: "#001327",
                    boxShadow: "0 0 18px rgba(0,255,255,0.8)",
                  }}
                >
                  Add
                </button>

                <div style={{ marginTop: 12, color: "#bffcff", fontSize: 12, opacity: 0.9, textAlign: "center" }}>
                  Tip: reminders are enabled automatically.
                </div>

                <div style={{ marginTop: 8, color: "#bffcff", fontSize: 12, opacity: 0.85, textAlign: "center" }}>
                  Sync: {SYNC_ENABLED ? (isHydrated ? "✅ connected" : "⏳ loading...") : "⚠️ disabled (set VITE_API_BASE)"}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
