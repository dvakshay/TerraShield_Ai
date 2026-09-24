import {
  AlertTriangle,
  Brain,
  CloudRain,
  Droplets,
  MapPin,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Waves,
} from "lucide-react";

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

interface AlertIntelligenceProps {
  monitoring: MonitoringData[];
}

function getRiskColor(level: string) {
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

function getRiskBorder(level: string) {
  switch (level.toUpperCase()) {
    case "CRITICAL":
      return "border-red-500/25";
    case "HIGH":
      return "border-orange-500/25";
    case "MODERATE":
      return "border-yellow-500/25";
    default:
      return "border-emerald-500/25";
  }
}

function getRiskBackground(level: string) {
  switch (level.toUpperCase()) {
    case "CRITICAL":
      return "bg-red-500/[0.045]";
    case "HIGH":
      return "bg-orange-500/[0.045]";
    case "MODERATE":
      return "bg-yellow-500/[0.045]";
    default:
      return "bg-emerald-500/[0.045]";
  }
}

function getAlertReasons(item: MonitoringData) {
  const reasons: string[] = [];

  if (item.sensors.rainfall_intensity >= 70) {
    reasons.push("High rainfall intensity");
  } else if (item.sensors.rainfall_intensity >= 40) {
    reasons.push("Elevated rainfall intensity");
  }

  if (item.sensors.soil_moisture >= 75) {
    reasons.push("High soil moisture");
  } else if (item.sensors.soil_moisture >= 60) {
    reasons.push("Elevated soil moisture");
  }

  if (item.sensors.slope >= 35) {
    reasons.push("Steep terrain");
  } else if (item.sensors.slope >= 25) {
    reasons.push("Elevated terrain slope");
  }

  if (item.risk.landslide >= 70) {
    reasons.push("High landslide risk");
  } else if (item.risk.landslide >= 50) {
    reasons.push("Elevated landslide risk");
  }

  if (item.risk.flood >= 70) {
    reasons.push("High flood risk");
  } else if (item.risk.flood >= 50) {
    reasons.push("Elevated flood risk");
  }

  if (reasons.length === 0) {
    reasons.push("Routine environmental monitoring");
  }

  return reasons;
}

function getResponse(item: MonitoringData) {
  if (item.risk.overall >= 85) {
    return "Initiate emergency evacuation protocol for vulnerable zones.";
  }

  if (item.risk.overall >= 70) {
    return "Prepare evacuation of vulnerable zones and response teams.";
  }

  if (item.risk.overall >= 50) {
    return "Increase monitoring and prepare emergency response teams.";
  }

  if (item.risk.overall >= 30) {
    return "Continue enhanced monitoring of environmental conditions.";
  }

  return item.recommended_action;
}

function getPriority(level: string) {
  switch (level.toUpperCase()) {
    case "CRITICAL":
      return "IMMEDIATE";
    case "HIGH":
      return "HIGH";
    case "MODERATE":
      return "MONITOR";
    default:
      return "NORMAL";
  }
}

function getAlertIcon(level: string) {
  switch (level.toUpperCase()) {
    case "CRITICAL":
      return ShieldAlert;
    case "HIGH":
      return AlertTriangle;
    default:
      return Siren;
  }
}

function AlertIntelligence({ monitoring }: AlertIntelligenceProps) {
  const alerts = [...monitoring]
    .filter((item) => item.risk.level.toUpperCase() !== "LOW")
    .sort((a, b) => b.risk.overall - a.risk.overall);

  const criticalCount = monitoring.filter(
    (item) => item.risk.level.toUpperCase() === "CRITICAL"
  ).length;

  const highCount = monitoring.filter(
    (item) => item.risk.level.toUpperCase() === "HIGH"
  ).length;

  const onlineCount = monitoring.filter(
    (item) => item.sensors.sensor_status.toUpperCase() === "ONLINE"
  ).length;

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-red-400">
          <Siren className="h-3.5 w-3.5" />
          Emergency Intelligence
        </div>

        <h2 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
          Alert Intelligence
        </h2>

        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Active risk conditions, environmental evidence, and recommended
          response actions across the monitored network.
        </p>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.035] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Active Alerts
            </span>
            <Siren className="h-5 w-5 text-red-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-red-400">
            {alerts.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Locations requiring attention
          </div>
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.035] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              High Priority
            </span>
            <AlertTriangle className="h-5 w-5 text-orange-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-orange-400">
            {criticalCount + highCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Critical and high risk locations
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.035] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Sensor Network
            </span>
            <Radio className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-end gap-2">
            <div className="text-3xl font-bold text-cyan-400">
              {onlineCount}
            </div>
            <div className="pb-1 text-xs text-slate-600">
              / {monitoring.length} online
            </div>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Live telemetry nodes
          </div>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.035] p-10 text-center">
          <ShieldCheck className="mx-auto h-9 w-9 text-emerald-400" />
          <div className="mt-4 font-semibold text-emerald-300">
            No Active Alerts
          </div>
          <p className="mt-1 text-sm text-slate-500">
            All monitored locations are currently below the active alert
            threshold.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((item, index) => {
            const AlertIcon = getAlertIcon(item.risk.level);
            const reasons = getAlertReasons(item);
            const riskColor = getRiskColor(item.risk.level);

            return (
              <article
                key={item.location.id}
                className={`overflow-hidden rounded-2xl border ${getRiskBorder(
                  item.risk.level
                )} ${getRiskBackground(item.risk.level)}`}
              >
                <div className="border-b border-white/[0.07] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${getRiskBorder(
                          item.risk.level
                        )}`}
                      >
                        <AlertIcon className={`h-5 w-5 ${riskColor}`} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-100">
                            {item.location.village}
                          </h3>

                          <span
                            className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${getRiskBorder(
                              item.risk.level
                            )} ${riskColor}`}
                          >
                            {item.risk.level}
                          </span>

                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                            {getPriority(item.risk.level)}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.location.district}, {item.location.state}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
                          Alert
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-300">
                          #{String(index + 1).padStart(2, "0")}
                        </div>
                      </div>

                      <div className="h-9 w-px bg-white/10" />

                      <div>
                        <div className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
                          Risk Index
                        </div>
                        <div className={`mt-1 text-2xl font-bold ${riskColor}`}>
                          {item.risk.overall.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-5 xl:grid-cols-[1fr_1fr_1.1fr]">
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
                      Trigger Conditions
                    </div>

                    <div className="space-y-2">
                      {reasons.map((reason) => (
                        <div
                          key={reason}
                          className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-2.5 text-xs text-slate-300"
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
                      <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <CloudRain className="h-3 w-3 text-cyan-400" />
                          Rainfall
                        </div>
                        <div className="mt-2 text-sm font-semibold text-cyan-300">
                          {item.sensors.rainfall_intensity.toFixed(1)}{" "}
                          <span className="text-[9px] text-slate-600">
                            mm/hr
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Droplets className="h-3 w-3 text-blue-400" />
                          Soil Moisture
                        </div>
                        <div className="mt-2 text-sm font-semibold text-blue-300">
                          {item.sensors.soil_moisture.toFixed(1)}%
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Waves className="h-3 w-3 text-orange-400" />
                          Terrain Slope
                        </div>
                        <div className="mt-2 text-sm font-semibold text-orange-300">
                          {item.sensors.slope.toFixed(1)}°
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <ShieldAlert className="h-3 w-3 text-red-400" />
                          Landslide
                        </div>
                        <div className="mt-2 text-sm font-semibold text-red-300">
                          {item.risk.landslide.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      Recommended Response
                    </div>

                    <div className="h-full rounded-xl border border-emerald-400/10 bg-emerald-400/[0.035] p-4">
                      <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
                        System Recommendation
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {getResponse(item)}
                      </p>

                      <div className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-3 text-[10px] text-slate-600">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.sensors.sensor_status.toUpperCase() ===
                            "ONLINE"
                              ? "bg-emerald-400"
                              : "bg-red-400"
                          }`}
                        />
                        Sensor status: {item.sensors.sensor_status}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/[0.07] bg-black/[0.08] px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="mr-2 font-semibold uppercase tracking-wider text-slate-600">
                      Detection Pipeline
                    </span>
                    <span className="rounded-md bg-cyan-400/5 px-2 py-1 text-cyan-400">
                      Sensor Reading
                    </span>
                    <span className="text-slate-700">→</span>
                    <span className="rounded-md bg-cyan-400/5 px-2 py-1 text-cyan-400">
                      Risk Assessment
                    </span>
                    <span className="text-slate-700">→</span>
                    <span className="rounded-md bg-orange-400/5 px-2 py-1 text-orange-400">
                      Threshold Evaluation
                    </span>
                    <span className="text-slate-700">→</span>
                    <span className="rounded-md bg-red-400/5 px-2 py-1 text-red-400">
                      Alert Generated
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-5">
        <div className="flex items-start gap-3">
          <Brain className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
          <div>
            <div className="font-semibold text-slate-200">
              Decision Context
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              TerraShield combines rainfall, soil moisture, terrain slope,
              and historical hazard indicators to produce a prototype risk
              assessment. Alerts are generated from the current rule-based
              risk engine and should be treated as decision-support
              information rather than a scientifically validated probability
              of an event.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertIntelligence;
