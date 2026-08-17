import React, { useEffect, useMemo, useState } from "react";
import { Clock, Mail, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import logo from "../../pictures/logo.png";
import "./maintenance.css";

const defaultConfig = {
  resumeAt: "",
  headline: "A brighter MCCHST is loading",
  message:
    "We are polishing the portal, tightening a few systems, and preparing a smoother experience for students, applicants, and staff.",
  contactLabel: "Contact support",
  contactHref: "mailto:support@mcchstfuntua.edu.ng",
};

const getConfig = () => ({
  ...defaultConfig,
  ...(window.MCCHST_MAINTENANCE || {}),
});

const formatResumeTime = (resumeAt) => {
  if (!resumeAt) return "We will announce the reopening time shortly.";

  const parsed = new Date(resumeAt);
  if (Number.isNaN(parsed.getTime())) return resumeAt;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(parsed);
};

const getCountdown = (resumeAt) => {
  const target = new Date(resumeAt).getTime();
  if (!resumeAt || Number.isNaN(target)) return null;

  const remaining = Math.max(0, target - Date.now());
  const totalMinutes = Math.floor(remaining / 60000);

  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  };
};

export default function MaintenancePage() {
  const config = getConfig();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    document.title = "Maintenance Mode | MCCHST Funtua";
    const interval = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  const resumeLabel = useMemo(
    () => formatResumeTime(config.resumeAt),
    [config.resumeAt],
  );
  const countdown = useMemo(
    () => getCountdown(config.resumeAt),
    [config.resumeAt, now],
  );

  return (
    <main className="maintenance-page">
      <div className="maintenance-pattern" />
      <div className="maintenance-orb maintenance-orb-gold" />
      <div className="maintenance-orb maintenance-orb-green" />

      <section className="maintenance-shell">
        <header className="maintenance-header">
          <div className="maintenance-brand">
            <img src={logo} alt="MCCHST Funtua logo" />
            <div>
              <p className="maintenance-brand-title">MCCHST Funtua</p>
              <p className="maintenance-brand-subtitle">Portal Maintenance</p>
            </div>
          </div>
          <div className="maintenance-pill">We are making things better</div>
        </header>

        <div className="maintenance-grid">
          <div className="maintenance-copy">
            <div className="maintenance-greeting">
              <Sparkles size={18} />
              Greetings from MCCHST Funtua
            </div>

            <h1>{config.headline}</h1>
            <p className="maintenance-message">{config.message}</p>

            <div className="maintenance-cards">
              <div className="maintenance-card">
                <Clock size={22} />
                <span>Expected Resume</span>
                <strong>{resumeLabel}</strong>
              </div>
              <div className="maintenance-card">
                <Wrench size={22} />
                <span>Current Work</span>
                <strong>Portal upgrades and system checks</strong>
              </div>
              <div className="maintenance-card">
                <ShieldCheck size={22} />
                <span>Your Data</span>
                <strong>Safe while we complete maintenance</strong>
              </div>
            </div>

            <a className="maintenance-contact" href={config.contactHref}>
              <Mail size={18} />
              {config.contactLabel}
            </a>
          </div>

          <aside className="maintenance-countdown">
            <p className="maintenance-countdown-label">Countdown</p>
            {countdown ? (
              <div className="maintenance-time-grid">
                {[
                  ["Days", countdown.days],
                  ["Hours", countdown.hours],
                  ["Minutes", countdown.minutes],
                ].map(([label, value]) => (
                  <div className="maintenance-time-box" key={label}>
                    <strong>{String(value).padStart(2, "0")}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="maintenance-note">
                Our team is finalizing the schedule. Please check back soon.
              </p>
            )}
            <div className="maintenance-progress">
              <span />
            </div>
            <p className="maintenance-note">
              Thank you for your patience. We will welcome you back with a
              cleaner, faster portal experience.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
