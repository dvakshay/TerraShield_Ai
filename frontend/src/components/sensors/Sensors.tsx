import {
  Activity,
  CloudRain,
  Droplets,
  Gauge,
  MapPin,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Waves,
  Zap,
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

interface SensorsProps {
  monitoring: MonitoringData[];
  selectedLocation: string;
  onSelectLocation: (locationId: string) => void;
}

function getRiskColor(level: string) {
  switch (level.toUpperCase()) {
    case "CRITICAL":
      return "#f87171";
    case "HIGH":
      return "#fb923c";
    case "MODERATE":
      return "#facc15";
    default:
      return "#34d399";
  }
}

function getRiskLabel(level: string) {
  switch (level.toUpperCase()) {
    case "CRITICAL":
      return "CRITICAL";
    case "HIGH":
      return "HIGH";
    case "MODERATE":
      return "MODERATE";
    default:
      return "LOW";
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getRainfallState(value: number) {
  if (value >= 70) return "HIGH";
  if (value >= 40) return "ELEVATED";
  if (value >= 20) return "MODERATE";
  return "LOW";
}

function getMoistureState(value: number) {
  if (value >= 75) return "HIGH";
  if (value >= 60) return "ELEVATED";
  if (value >= 40) return "MODERATE";
  return "LOW";
}

function getSlopeState(value: number) {
  if (value >= 35) return "HIGH";
  if (value >= 25) return "ELEVATED";
  if (value >= 15) return "MODERATE";
  return "LOW";
}

function stateColor(state: string) {
  switch (state) {
    case "HIGH":
      return "text-red-300";
    case "ELEVATED":
      return "text-orange-300";
    case "MODERATE":
      return "text-yellow-300";
    default:
      return "text-emerald-300";
  }
}

function Sensors({
  monitoring,
  selectedLocation,
  onSelectLocation,
}: SensorsProps) {
  const onlineCount = monitoring.filter(
    (item) =>
      item.sensors.sensor_status.toUpperCase() === "ONLINE"
  ).length;

  const averageRainfall =
    monitoring.length > 0
      ? monitoring.reduce(
          (sum, item) =>
            sum + item.sensors.rainfall_intensity,
          0
        ) / monitoring.length
      : 0;

  const averageMoisture =
    monitoring.length > 0
      ? monitoring.reduce(
          (sum, item) => sum + item.sensors.soil_moisture,
          0
        ) / monitoring.length
      : 0;

  const averageSlope =
    monitoring.length > 0
      ? monitoring.reduce(
          (sum, item) => sum + item.sensors.slope,
          0
        ) / monitoring.length
      : 0;

  const latestTimestamp =
    monitoring.length > 0
      ? [...monitoring].sort(
          (a, b) =>
            new Date(b.sensors.timestamp).getTime() -
            new Date(a.sensors.timestamp).getTime()
        )[0].sensors.timestamp
      : null;

  const highestRainfall =
    monitoring.length > 0
      ? [...monitoring].sort(
          (a, b) =>
            b.sensors.rainfall_intensity -
            a.sensors.rainfall_intensity
        )[0]
      : null;

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-400">
          <Radio className="h-3.5 w-3.5" />
          Telemetry Network
        </div>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
              Environmental Sensor Network
            </h2>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Live environmental telemetry from distributed
              monitoring locations across the Uttarakhand network.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-wider text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live Telemetry
          </div>
        </div>
      </div>

      {/* NETWORK OVERVIEW */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Monitored Locations
              </div>

              <div className="mt-3 text-3xl font-bold text-slate-100">
                {monitoring.length}
              </div>
            </div>

            <MapPin className="h-5 w-5 text-cyan-400" />
          </div>

          <div className="mt-3 text-[10px] text-slate-600">
            Distributed field monitoring points
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Sensor Network
              </div>

              <div className="mt-3 flex items-end gap-2">
                <div className="text-3xl font-bold text-emerald-300">
                  {onlineCount}
                </div>

                <div className="pb-1 text-xs text-slate-600">
                  / {monitoring.length} online
                </div>
              </div>
            </div>

            <Radio className="h-5 w-5 text-emerald-400" />
          </div>

          <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            NETWORK OPERATIONAL
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Network Rainfall
              </div>

              <div className="mt-3 text-3xl font-bold text-cyan-300">
                {averageRainfall.toFixed(1)}
              </div>

              <div className="mt-1 text-[10px] text-slate-600">
                Average mm/hr
              </div>
            </div>

            <CloudRain className="h-5 w-5 text-cyan-400" />
          </div>

          <div className="mt-3 text-[10px] text-slate-500">
            Across monitored locations
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Last Network Update
              </div>

              <div className="mt-3 text-xl font-bold text-slate-200">
                {latestTimestamp
                  ? new Date(
                      latestTimestamp
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "--:--:--"}
              </div>
            </div>

            <Activity className="h-5 w-5 text-cyan-400" />
          </div>

          <div className="mt-3 text-[10px] text-slate-600">
            Automatic telemetry refresh
          </div>
        </div>
      </div>

      {/* ENVIRONMENTAL SNAPSHOT */}
      <div className="mb-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-cyan-400" />

              <h3 className="font-semibold text-slate-200">
                Network Environmental Snapshot
              </h3>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Aggregated environmental conditions across the
              monitored network.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CloudRain className="h-4 w-4 text-cyan-400" />
                  Rainfall
                </div>

                <span
                  className={`text-[9px] font-semibold ${stateColor(
                    getRainfallState(averageRainfall)
                  )}`}
                >
                  {getRainfallState(averageRainfall)}
                </span>
              </div>

              <div className="mt-4 text-2xl font-bold text-slate-100">
                {averageRainfall.toFixed(1)}
              </div>

              <div className="text-[10px] text-slate-600">
                mm/hr average
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                  style={{
                    width: `${clamp(
                      averageRainfall,
                      0,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Droplets className="h-4 w-4 text-blue-400" />
                  Soil Moisture
                </div>

                <span
                  className={`text-[9px] font-semibold ${stateColor(
                    getMoistureState(averageMoisture)
                  )}`}
                >
                  {getMoistureState(averageMoisture)}
                </span>
              </div>

              <div className="mt-4 text-2xl font-bold text-slate-100">
                {averageMoisture.toFixed(1)}
              </div>

              <div className="text-[10px] text-slate-600">
                % network average
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-blue-400 transition-all duration-700"
                  style={{
                    width: `${clamp(
                      averageMoisture,
                      0,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Waves className="h-4 w-4 text-orange-400" />
                  Terrain Slope
                </div>

                <span
                  className={`text-[9px] font-semibold ${stateColor(
                    getSlopeState(averageSlope)
                  )}`}
                >
                  {getSlopeState(averageSlope)}
                </span>
              </div>

              <div className="mt-4 text-2xl font-bold text-slate-100">
                {averageSlope.toFixed(1)}°
              </div>

              <div className="text-[10px] text-slate-600">
                network average
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-orange-400 transition-all duration-700"
                  style={{
                    width: `${clamp(
                      (averageSlope / 45) * 100,
                      0,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-5">
          <div className="flex items-start gap-3">
            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-400">
                Network Insight
              </div>

              <h3 className="mt-1 font-semibold text-slate-200">
                Highest rainfall signal
              </h3>

              {highestRainfall ? (
                <>
                  <div className="mt-4 text-3xl font-bold text-cyan-300">
                    {highestRainfall.sensors.rainfall_intensity.toFixed(
                      1
                    )}{" "}
                    <span className="text-sm font-medium text-cyan-300/50">
                      mm/hr
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400" />

                    {highestRainfall.location.village},{" "}
                    {highestRainfall.location.district}
                  </div>

                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-[10px] leading-5 text-slate-500">
                    This location currently reports the highest
                    rainfall intensity among the monitored sensor
                    nodes.
                  </div>
                </>
              ) : (
                <div className="mt-4 text-sm text-slate-500">
                  Waiting for telemetry data.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LOCATION SENSOR STATUS */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-cyan-400" />

              <h3 className="font-semibold text-slate-200">
                Location Sensor Status
              </h3>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Select a sensor node to update the active location
              context.
            </p>
          </div>

          <div className="text-[10px] uppercase tracking-wider text-slate-600">
            {monitoring.length} field nodes
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {monitoring.map((item) => {
            const isSelected =
              selectedLocation === item.location.id;

            const isOnline =
              item.sensors.sensor_status.toUpperCase() ===
              "ONLINE";

            const riskColor = getRiskColor(item.risk.level);

            const rainfallState = getRainfallState(
              item.sensors.rainfall_intensity
            );

            const moistureState = getMoistureState(
              item.sensors.soil_moisture
            );

            const slopeState = getSlopeState(
              item.sensors.slope
            );

            return (
              <button
                key={item.location.id}
                onClick={() =>
                  onSelectLocation(item.location.id)
                }
                className={`group rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                  isSelected
                    ? "border-cyan-400/30 bg-cyan-400/[0.04]"
                    : "border-white/[0.08] bg-white/[0.015] hover:border-white/15 hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isSelected
                          ? "bg-cyan-400/10 text-cyan-400"
                          : "bg-white/[0.04] text-slate-500"
                      }`}
                    >
                      <Radio className="h-4 w-4" />
                    </div>

                    <div>
                      <div className="font-semibold text-slate-200">
                        {item.location.village}
                      </div>

                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-600">
                        <MapPin className="h-3 w-3" />

                        {item.location.district},{" "}
                        {item.location.state}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`flex items-center justify-end gap-1.5 text-[9px] font-semibold uppercase ${
                        isOnline
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isOnline
                            ? "animate-pulse bg-emerald-400"
                            : "bg-red-400"
                        }`}
                      />

                      {item.sensors.sensor_status}
                    </div>

                    <div
                      className="mt-2 text-[9px] font-semibold"
                      style={{ color: riskColor }}
                    >
                      {getRiskLabel(item.risk.level)}
                    </div>
                  </div>
                </div>

                <div
                  className="mt-5 flex items-center justify-between rounded-xl border px-3 py-2"
                  style={{
                    borderColor: `${riskColor}22`,
                    backgroundColor: `${riskColor}08`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {item.risk.level.toUpperCase() === "LOW" ? (
                      <ShieldCheck
                        className="h-3.5 w-3.5"
                        style={{ color: riskColor }}
                      />
                    ) : (
                      <ShieldAlert
                        className="h-3.5 w-3.5"
                        style={{ color: riskColor }}
                      />
                    )}

                    <span className="text-[9px] uppercase tracking-wider text-slate-500">
                      Overall Risk
                    </span>
                  </div>

                  <span
                    className="text-sm font-bold"
                    style={{ color: riskColor }}
                  >
                    {item.risk.overall.toFixed(1)}
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CloudRain className="h-3.5 w-3.5 text-cyan-400" />

                        <span className="text-[10px] font-medium text-slate-400">
                          Rainfall
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[8px] font-semibold ${stateColor(
                            rainfallState
                          )}`}
                        >
                          {rainfallState}
                        </span>

                        <span className="text-xs font-semibold text-slate-300">
                          {item.sensors.rainfall_intensity.toFixed(
                            1
                          )}{" "}
                          <span className="text-[9px] text-slate-600">
                            mm/hr
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                        style={{
                          width: `${clamp(
                            item.sensors.rainfall_intensity,
                            0,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-3.5 w-3.5 text-blue-400" />

                        <span className="text-[10px] font-medium text-slate-400">
                          Soil Moisture
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[8px] font-semibold ${stateColor(
                            moistureState
                          )}`}
                        >
                          {moistureState}
                        </span>

                        <span className="text-xs font-semibold text-slate-300">
                          {item.sensors.soil_moisture.toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-blue-400 transition-all duration-700"
                        style={{
                          width: `${clamp(
                            item.sensors.soil_moisture,
                            0,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Waves className="h-3.5 w-3.5 text-orange-400" />

                        <span className="text-[10px] font-medium text-slate-400">
                          Terrain Slope
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[8px] font-semibold ${stateColor(
                            slopeState
                          )}`}
                        >
                          {slopeState}
                        </span>

                        <span className="text-xs font-semibold text-slate-300">
                          {item.sensors.slope.toFixed(1)}°
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-orange-400 transition-all duration-700"
                        style={{
                          width: `${clamp(
                            (item.sensors.slope / 45) * 100,
                            0,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <span className="text-[9px] text-slate-600">
                    NODE {item.location.id}
                  </span>

                  <span className="text-[9px] text-slate-600">
                    Updated{" "}
                    {new Date(
                      item.sensors.timestamp
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PIPELINE */}
      <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-5">
        <div className="flex items-start gap-3">
          <Activity className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

          <div className="w-full">
            <div className="font-semibold text-slate-200">
              TerraShield Telemetry Pipeline
            </div>

            <p className="mt-1 text-[10px] text-slate-600">
              Environmental measurements flow into the risk
              assessment engine.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["01", "Sense", "Rainfall, moisture and terrain inputs"],
                ["02", "Stream", "Live telemetry reaches the platform"],
                ["03", "Assess", "Risk engine evaluates conditions"],
                ["04", "Respond", "Risk state informs response actions"],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-4"
                >
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-cyan-400">
                    {number}
                  </div>

                  <div className="mt-2 text-xs font-medium text-slate-300">
                    {title}
                  </div>

                  <div className="mt-1 text-[10px] leading-4 text-slate-600">
                    {description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 px-1 text-[9px] leading-4 text-slate-600">
        Sensor values shown by the current prototype represent
        simulated telemetry for demonstration purposes.
      </div>
    </div>
  );
}

export default Sensors;