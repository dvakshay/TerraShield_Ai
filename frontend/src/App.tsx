import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  AlertTriangle,
  Bell,
  Brain,
  CloudRain,
  Droplets,
  Gauge,
  Home,
  Map,
  MapPin,
  Menu,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Waves,
  X,
} from "lucide-react";

import RiskMap from "./components/maps/RiskMap";
import AIForecast from "./components/forecast/AIForecast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

interface Location {
  id: string;
  village: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  rainfall_intensity: number;
  rainfall_24h: number;
  soil_moisture: number;
  slope: number;
  historical_landslides: number;
  historical_floods: number;
}

interface LocationsResponse {
  count: number;
  locations: Location[];
}

interface MonitoringData {
  location: {
    id: string;
    village: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  sensors: {
    location_id: string;
    timestamp: string;
    rainfall_intensity: number;
    soil_moisture: number;
    slope: number;
    sensor_status: string;
  };
  risk: {
    landslide: number;
    flood: number;
    overall: number;
    level: string;
  };
  recommended_action: string;
}

type NavigationSection =
  | "command"
  | "map"
  | "forecast"
  | "sensors"
  | "alerts";

const navigationItems = [
  {
    id: "command" as NavigationSection,
    label: "Command Center",
    icon: Home,
  },
  {
    id: "map" as NavigationSection,
    label: "Risk Map",
    icon: Map,
  },
  {
    id: "forecast" as NavigationSection,
    label: "AI Forecast",
    icon: Brain,
  },
  {
    id: "sensors" as NavigationSection,
    label: "Sensors",
    icon: Radio,
  },
  {
    id: "alerts" as NavigationSection,
    label: "Alerts",
    icon: Siren,
  },
];

function riskColor(level: string) {
  switch (level.toUpperCase()) {
    case "CRITICAL":
      return "text-red-400";
    case "HIGH":
      return "text-orange-400";
    case "MODERATE":
      return "text-yellow-400";
    default:
      return "text-emerald-400";
  }
}

function riskBackground(level: string) {
  switch (level.toUpperCase()) {
    case "CRITICAL":
      return "bg-red-500/10 border-red-500/30";
    case "HIGH":
      return "bg-orange-500/10 border-orange-500/30";
    case "MODERATE":
      return "bg-yellow-500/10 border-yellow-500/30";
    default:
      return "bg-emerald-500/10 border-emerald-500/30";
  }
}

function getAlertReason(data: MonitoringData) {
  const reasons: string[] = [];

  if (data.sensors.rainfall_intensity >= 60) {
    reasons.push("High rainfall intensity");
  } else if (data.sensors.rainfall_intensity >= 30) {
    reasons.push("Elevated rainfall");
  }

  if (data.sensors.soil_moisture >= 75) {
    reasons.push("High soil moisture");
  } else if (data.sensors.soil_moisture >= 60) {
    reasons.push("Elevated soil moisture");
  }

  if (data.sensors.slope >= 35) {
    reasons.push("Steep terrain");
  }

  if (data.risk.landslide >= 60) {
    reasons.push("Elevated landslide risk");
  }

  if (data.risk.flood >= 60) {
    reasons.push("Elevated flood risk");
  }

  if (reasons.length === 0) {
    reasons.push("Routine environmental monitoring");
  }

  return reasons;
}

function getAlertIcon(level: string) {
  switch (level.toUpperCase()) {
    case "CRITICAL":
      return ShieldAlert;
    case "HIGH":
      return AlertTriangle;
    case "MODERATE":
      return Bell;
    default:
      return ShieldCheck;
  }
}

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [monitoring, setMonitoring] = useState<MonitoringData[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<string>("LOC001");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [backendOnline, setBackendOnline] = useState(false);

  const fetchData = async () => {
    try {
      /*
       * IMPORTANT:
       * /locations returns:
       *
       * {
       *   count: 5,
       *   locations: [...]
       * }
       *
       * Therefore we must use locationsResponse.data.locations.
       */
      const locationsResponse = await axios.get<LocationsResponse>(
        `${API_BASE}/locations`
      );

      const locationData = locationsResponse.data.locations;

      setLocations(locationData);

      const monitoringResults = await Promise.all(
        locationData.map(async (location) => {
          const response = await axios.get<MonitoringData>(
            `${API_BASE}/monitoring/${location.id}`
          );

          return response.data;
        })
      );

      setMonitoring(monitoringResults);
      setBackendOnline(true);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch TerraShield data:", error);
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = window.setInterval(() => {
      fetchData();
    }, 10000);

    return () => window.clearInterval(interval);
  }, []);

  const selectedMonitoring = useMemo(
    () =>
      monitoring.find(
        (item) => item.location.id === selectedLocation
      ) ?? monitoring[0],
    [monitoring, selectedLocation]
  );

  const riskCounts = useMemo(() => {
    return {
      critical: monitoring.filter(
        (item) => item.risk.level.toUpperCase() === "CRITICAL"
      ).length,
      high: monitoring.filter(
        (item) => item.risk.level.toUpperCase() === "HIGH"
      ).length,
      moderate: monitoring.filter(
        (item) => item.risk.level.toUpperCase() === "MODERATE"
      ).length,
      low: monitoring.filter(
        (item) => item.risk.level.toUpperCase() === "LOW"
      ).length,
    };
  }, [monitoring]);

  const activeAlerts = useMemo(() => {
    return monitoring
      .filter(
        (item) => item.risk.level.toUpperCase() !== "LOW"
      )
      .sort((a, b) => b.risk.overall - a.risk.overall);
  }, [monitoring]);

  const highestRisk = useMemo(() => {
    if (monitoring.length === 0) return null;

    return [...monitoring].sort(
      (a, b) => b.risk.overall - a.risk.overall
    )[0];
  }, [monitoring]);

  const navigateTo = (section: NavigationSection) => {
    const element = document.getElementById(
      `section-${section}`
    );

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-white/10 bg-[#091523]/95 backdrop-blur-xl md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center border-b border-white/10 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/30">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
              </div>

              <div>
                <div className="text-sm font-bold tracking-wide">
                  TERRASHIELD
                </div>

                <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-400">
                  AI Command
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-3 py-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-slate-400 transition-all hover:bg-white/5 hover:text-white"
                >
                  <Icon className="h-4 w-4 transition-colors group-hover:text-cyan-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    backendOnline
                      ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                      : "bg-red-400"
                  }`}
                />

                <span className="text-xs font-medium text-slate-300">
                  System {backendOnline ? "Online" : "Offline"}
                </span>
              </div>

              <div className="text-[10px] text-slate-500">
                Live monitoring active
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="absolute left-0 top-0 h-full w-72 border-r border-white/10 bg-[#091523] p-5">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-7 w-7 text-cyan-400" />

                <div>
                  <div className="text-sm font-bold">
                    TERRASHIELD
                  </div>

                  <div className="text-[9px] tracking-[0.25em] text-cyan-400">
                    AI COMMAND
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    <Icon className="h-4 w-4 text-cyan-400" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="min-h-screen md:ml-64">
        {/* Desktop Top Bar */}
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-white/10 bg-[#07111f]/85 px-6 backdrop-blur-xl md:flex">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Disaster Intelligence Platform
            </div>

            <div className="text-sm font-medium text-slate-200">
              Uttarakhand Regional Monitoring Network
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />

              Updated{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              LIVE
            </div>
          </div>
        </header>

        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#07111f]/90 px-4 backdrop-blur-xl md:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/5"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />

            <div>
              <div className="text-xs font-bold">
                TERRASHIELD
              </div>

              <div className="text-[8px] tracking-[0.2em] text-cyan-400">
                AI COMMAND
              </div>
            </div>
          </div>

          <span
            className={`h-2 w-2 rounded-full ${
              backendOnline ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
        </header>

        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
          {/* COMMAND CENTER */}
          <section id="section-command" className="scroll-mt-24">
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-400">
                <Activity className="h-3.5 w-3.5" />
                Situation Awareness
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Regional Command Center
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Real-time monitoring of landslide and flash-flood risk
                across high-risk terrain.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400">
                    Critical
                  </span>

                  <ShieldAlert className="h-5 w-5 text-red-400" />
                </div>

                <div className="text-3xl font-bold text-red-400">
                  {riskCounts.critical}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Immediate attention
                </div>
              </div>

              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400">
                    High
                  </span>

                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                </div>

                <div className="text-3xl font-bold text-orange-400">
                  {riskCounts.high}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Enhanced monitoring
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400">
                    Moderate
                  </span>

                  <Bell className="h-5 w-5 text-yellow-400" />
                </div>

                <div className="text-3xl font-bold text-yellow-400">
                  {riskCounts.moderate}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Continue monitoring
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400">
                    Low
                  </span>

                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>

                <div className="text-3xl font-bold text-emerald-400">
                  {riskCounts.low}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Normal monitoring
                </div>
              </div>
            </div>

            {highestRisk && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                      <Gauge className="h-4 w-4" />
                      Highest Current Risk
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-cyan-400" />

                      <div>
                        <div className="font-semibold text-white">
                          {highestRisk.location.village}
                        </div>

                        <div className="text-xs text-slate-500">
                          {highestRisk.location.district},{" "}
                          {highestRisk.location.state}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-xs text-slate-500">
                        Overall Risk
                      </div>

                      <div
                        className={`text-3xl font-bold ${riskColor(
                          highestRisk.risk.level
                        )}`}
                      >
                        {highestRisk.risk.overall.toFixed(0)}%
                      </div>
                    </div>

                    <div
                      className={`rounded-xl border px-4 py-2 text-xs font-semibold ${riskBackground(
                        highestRisk.risk.level
                      )} ${riskColor(highestRisk.risk.level)}`}
                    >
                      {highestRisk.risk.level}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* MAP */}
          <section id="section-map" className="scroll-mt-24">
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-400">
                <Map className="h-3.5 w-3.5" />
                Geospatial Intelligence
              </div>

              <h2 className="text-xl font-bold sm:text-2xl">
                Live Risk Map
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a monitored location to inspect its current risk
                state.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              <RiskMap
                locations={locations}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
              />
            </div>
          </section>

          {/* AI FORECAST */}
          <section id="section-forecast" className="scroll-mt-24">
            {selectedMonitoring && (
              <AIForecast monitoring={selectedMonitoring} />
            )}
          </section>

          {/* SENSORS */}
          <section id="section-sensors" className="scroll-mt-24">
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-400">
                <Radio className="h-3.5 w-3.5" />
                Telemetry Network
              </div>

              <h2 className="text-xl font-bold sm:text-2xl">
                Environmental Sensors
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Live environmental telemetry from monitored locations.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {monitoring.map((item) => (
                <button
                  key={item.location.id}
                  onClick={() =>
                    setSelectedLocation(item.location.id)
                  }
                  className={`rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:bg-white/[0.04] ${
                    selectedLocation === item.location.id
                      ? "border-cyan-400/30 bg-cyan-400/[0.04]"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div>
                      <div className="font-semibold">
                        {item.location.village}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {item.location.district}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] uppercase text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {item.sensors.sensor_status}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white/[0.03] p-3">
                      <CloudRain className="mb-2 h-4 w-4 text-cyan-400" />

                      <div className="text-lg font-semibold">
                        {item.sensors.rainfall_intensity.toFixed(1)}
                      </div>

                      <div className="text-[10px] text-slate-500">
                        mm/hr
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/[0.03] p-3">
                      <Droplets className="mb-2 h-4 w-4 text-blue-400" />

                      <div className="text-lg font-semibold">
                        {item.sensors.soil_moisture.toFixed(1)}
                      </div>

                      <div className="text-[10px] text-slate-500">
                        soil %
                      </div>
                    </div>

                    <div className="rounded-xl bg-white/[0.03] p-3">
                      <Waves className="mb-2 h-4 w-4 text-orange-400" />

                      <div className="text-lg font-semibold">
                        {item.sensors.slope.toFixed(1)}
                      </div>

                      <div className="text-[10px] text-slate-500">
                        slope °
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* ALERT INTELLIGENCE */}
          <section id="section-alerts" className="scroll-mt-24">
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-red-400">
                <Siren className="h-3.5 w-3.5" />
                Emergency Intelligence
              </div>

              <h2 className="text-xl font-bold sm:text-2xl">
                Alert Intelligence
              </h2>

              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Active risk conditions, contributing environmental
                factors, sensor evidence, and recommended response
                actions.
              </p>
            </div>

            <div className="mb-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-500">
                    Active Alerts
                  </span>

                  <Siren className="h-5 w-5 text-red-400" />
                </div>

                <div className="mt-3 text-3xl font-bold text-red-400">
                  {activeAlerts.length}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Locations requiring attention
                </div>
              </div>

              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.04] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-500">
                    High Priority
                  </span>

                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                </div>

                <div className="mt-3 text-3xl font-bold text-orange-400">
                  {riskCounts.critical + riskCounts.high}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Critical + high risk locations
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-500">
                    Sensor Network
                  </span>

                  <Radio className="h-5 w-5 text-cyan-400" />
                </div>

                <div className="mt-3 text-3xl font-bold text-cyan-400">
                  {monitoring.length}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Monitored locations
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {activeAlerts.length === 0 ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-8 text-center">
                  <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-emerald-400" />

                  <div className="font-semibold text-emerald-400">
                    No active alerts
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    All monitored locations are currently below the
                    alert threshold.
                  </div>
                </div>
              ) : (
                activeAlerts.map((item, index) => {
                  const AlertIcon = getAlertIcon(item.risk.level);
                  const reasons = getAlertReason(item);

                  return (
                    <div
                      key={item.location.id}
                      className={`overflow-hidden rounded-2xl border ${riskBackground(
                        item.risk.level
                      )}`}
                    >
                      <div className="border-b border-white/10 p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-start gap-4">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${riskBackground(
                                item.risk.level
                              )}`}
                            >
                              <AlertIcon
                                className={`h-5 w-5 ${riskColor(
                                  item.risk.level
                                )}`}
                              />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold">
                                  {item.location.village}
                                </h3>

                                <span
                                  className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${riskBackground(
                                    item.risk.level
                                  )} ${riskColor(item.risk.level)}`}
                                >
                                  {item.risk.level}
                                </span>
                              </div>

                              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <MapPin className="h-3.5 w-3.5" />

                                {item.location.district},{" "}
                                {item.location.state}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                                Risk Index
                              </div>

                              <div
                                className={`text-2xl font-bold ${riskColor(
                                  item.risk.level
                                )}`}
                              >
                                {item.risk.overall.toFixed(0)}%
                              </div>
                            </div>

                            <div className="hidden h-10 w-px bg-white/10 sm:block" />

                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                                Alert #{index + 1}
                              </div>

                              <div className="text-sm font-medium text-slate-300">
                                Live
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_1fr_1fr]">
                        <div>
                          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
                            Trigger Conditions
                          </div>

                          <div className="space-y-2">
                            {reasons.map((reason) => (
                              <div
                                key={reason}
                                className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-slate-300"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                                {reason}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            <Radio className="h-3.5 w-3.5 text-cyan-400" />
                            Sensor Evidence
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-white/[0.03] p-3">
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <CloudRain className="h-3 w-3" />
                                Rainfall
                              </div>

                              <div className="mt-1 font-semibold text-cyan-300">
                                {item.sensors.rainfall_intensity.toFixed(
                                  1
                                )}{" "}
                                mm/hr
                              </div>
                            </div>

                            <div className="rounded-lg bg-white/[0.03] p-3">
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <Droplets className="h-3 w-3" />
                                Soil
                              </div>

                              <div className="mt-1 font-semibold text-blue-300">
                                {item.sensors.soil_moisture.toFixed(1)}%
                              </div>
                            </div>

                            <div className="rounded-lg bg-white/[0.03] p-3">
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <Waves className="h-3 w-3" />
                                Slope
                              </div>

                              <div className="mt-1 font-semibold text-orange-300">
                                {item.sensors.slope.toFixed(1)}°
                              </div>
                            </div>

                            <div className="rounded-lg bg-white/[0.03] p-3">
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <Gauge className="h-3 w-3" />
                                Landslide
                              </div>

                              <div className="mt-1 font-semibold text-red-300">
                                {item.risk.landslide.toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            Recommended Response
                          </div>

                          <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] p-4">
                            <div className="mb-2 text-xs font-semibold text-emerald-300">
                              SYSTEM RECOMMENDATION
                            </div>

                            <p className="text-sm leading-6 text-slate-300">
                              {item.risk.overall >= 85
                                ? "Initiate emergency evacuation protocol for vulnerable zones."
                                : item.risk.overall >= 70
                                ? "Prepare evacuation of vulnerable zones and response teams."
                                : item.recommended_action}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/10 bg-black/10 px-5 py-4">
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span className="font-semibold uppercase tracking-wider text-slate-400">
                            Detection Pipeline
                          </span>

                          <span className="text-cyan-400">
                            Sensor Reading
                          </span>

                          <span>→</span>

                          <span className="text-cyan-400">
                            Risk Assessment
                          </span>

                          <span>→</span>

                          <span className="text-orange-400">
                            Threshold Evaluation
                          </span>

                          <span>→</span>

                          <span className="text-red-400">
                            Alert Generated
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-5">
              <div className="flex items-start gap-3">
                <Brain className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

                <div>
                  <div className="font-semibold text-slate-200">
                    Decision Context
                  </div>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    TerraShield combines rainfall, soil moisture,
                    terrain slope, and historical hazard indicators to
                    produce a prototype risk assessment. Alerts are
                    generated from the current rule-based risk engine
                    and should be treated as decision-support
                    information rather than a scientifically validated
                    probability of an event.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SELECTED LOCATION */}
          {selectedMonitoring && (
            <section className="scroll-mt-24">
              <div className="mb-5">
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-400">
                  <MapPin className="h-3.5 w-3.5" />
                  Location Intelligence
                </div>

                <h2 className="text-xl font-bold sm:text-2xl">
                  {selectedMonitoring.location.village}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedMonitoring.location.district},{" "}
                  {selectedMonitoring.location.state}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                    <CloudRain className="h-4 w-4 text-cyan-400" />
                    Rainfall
                  </div>

                  <div className="text-2xl font-bold">
                    {selectedMonitoring.sensors.rainfall_intensity.toFixed(
                      1
                    )}
                  </div>

                  <div className="text-xs text-slate-500">
                    mm/hr
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                    <Droplets className="h-4 w-4 text-blue-400" />
                    Soil Moisture
                  </div>

                  <div className="text-2xl font-bold">
                    {selectedMonitoring.sensors.soil_moisture.toFixed(
                      1
                    )}
                  </div>

                  <div className="text-xs text-slate-500">%</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                    <Waves className="h-4 w-4 text-orange-400" />
                    Terrain Slope
                  </div>

                  <div className="text-2xl font-bold">
                    {selectedMonitoring.sensors.slope.toFixed(1)}
                  </div>

                  <div className="text-xs text-slate-500">
                    degrees
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                    <Gauge className="h-4 w-4 text-red-400" />
                    Overall Risk
                  </div>

                  <div
                    className={`text-2xl font-bold ${riskColor(
                      selectedMonitoring.risk.level
                    )}`}
                  >
                    {selectedMonitoring.risk.overall.toFixed(0)}%
                  </div>

                  <div className="text-xs text-slate-500">
                    {selectedMonitoring.risk.level}
                  </div>
                </div>
              </div>
            </section>
          )}

          <footer className="border-t border-white/10 pt-6 text-xs text-slate-600">
            <div className="flex flex-col justify-between gap-2 sm:flex-row">
              <span>
                TerraShield AI • Disaster Intelligence Platform
              </span>

              <span>
                Prototype • Rule-based risk assessment • Live simulated
                telemetry
              </span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;