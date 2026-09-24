import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  CloudRain,
  Droplets,
  Gauge,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
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

interface AIForecastProps {
  monitoring: MonitoringData;
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

function getRiskBackground(level: string) {
  switch (level.toUpperCase()) {
    case "CRITICAL":
      return "border-red-400/20 bg-red-400/[0.045]";
    case "HIGH":
      return "border-orange-400/20 bg-orange-400/[0.045]";
    case "MODERATE":
      return "border-yellow-400/20 bg-yellow-400/[0.045]";
    default:
      return "border-emerald-400/20 bg-emerald-400/[0.045]";
  }
}

function getRiskLabel(value: number) {
  if (value >= 70) return "HIGH";
  if (value >= 50) return "ELEVATED";
  if (value >= 30) return "MODERATE";
  return "LOW";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDriverState(value: number) {
  if (value >= 70) {
    return {
      label: "HIGH",
      className: "text-red-300 border-red-400/20 bg-red-400/[0.06]",
    };
  }

  if (value >= 50) {
    return {
      label: "ELEVATED",
      className: "text-orange-300 border-orange-400/20 bg-orange-400/[0.06]",
    };
  }

  if (value >= 30) {
    return {
      label: "MODERATE",
      className: "text-yellow-300 border-yellow-400/20 bg-yellow-400/[0.06]",
    };
  }

  return {
    label: "LOW",
    className: "text-emerald-300 border-emerald-400/20 bg-emerald-400/[0.06]",
  };
}

function AIForecast({ monitoring }: AIForecastProps) {
  const { location, sensors, risk, recommended_action } = monitoring;

  /*
   * Prototype trajectory model.
   *
   * This is intentionally presented as a scenario projection rather
   * than a scientifically validated probability forecast.
   *
   * The trajectory responds to current environmental pressure.
   * It is NOT trained on historical time-series data.
   */
  const trajectory = useMemo(() => {
    const rainfallPressure = clamp(
      sensors.rainfall_intensity / 100,
      0,
      1
    );

    const moisturePressure = clamp(
      sensors.soil_moisture / 100,
      0,
      1
    );

    const slopePressure = clamp(
      sensors.slope / 45,
      0,
      1
    );

    const environmentalPressure =
      rainfallPressure * 0.45 +
      moisturePressure * 0.35 +
      slopePressure * 0.2;

    const pressureDirection =
      environmentalPressure >= 0.65 ? 1 : -1;

    const changes = [
      -6,
      -4,
      -2,
      0,
      pressureDirection * 3,
      pressureDirection * 6,
      pressureDirection * 9,
    ];

    return changes.map((change) =>
      Number(clamp(risk.overall + change, 0, 100).toFixed(1))
    );
  }, [
    risk.overall,
    sensors.rainfall_intensity,
    sensors.soil_moisture,
    sensors.slope,
  ]);

  const riskDrivers = useMemo(() => {
    return [
      {
        name: "Rainfall",
        value: clamp(sensors.rainfall_intensity, 0, 100),
        display: `${sensors.rainfall_intensity.toFixed(1)} mm/hr`,
        icon: CloudRain,
        description: "Current rainfall intensity",
      },
      {
        name: "Soil Moisture",
        value: clamp(sensors.soil_moisture, 0, 100),
        display: `${sensors.soil_moisture.toFixed(1)}%`,
        icon: Droplets,
        description: "Ground saturation indicator",
      },
      {
        name: "Terrain Slope",
        value: clamp((sensors.slope / 45) * 100, 0, 100),
        display: `${sensors.slope.toFixed(1)}°`,
        icon: Waves,
        description: "Terrain instability factor",
      },
      {
        name: "Landslide Risk",
        value: clamp(risk.landslide, 0, 100),
        display: `${risk.landslide.toFixed(1)}%`,
        icon: ShieldAlert,
        description: "Current landslide risk index",
      },
    ];
  }, [
    sensors.rainfall_intensity,
    sensors.soil_moisture,
    sensors.slope,
    risk.landslide,
  ]);

  const trajectoryDirection =
    trajectory[trajectory.length - 1] > trajectory[3] + 2
      ? "RISING"
      : trajectory[trajectory.length - 1] < trajectory[3] - 2
        ? "DECLINING"
        : "STABLE";

  const trajectoryChange = Number(
    (
      trajectory[trajectory.length - 1] -
      trajectory[3]
    ).toFixed(1)
  );

  const trajectoryIcon =
    trajectoryDirection === "RISING"
      ? TrendingUp
      : trajectoryDirection === "DECLINING"
        ? TrendingDown
        : Activity;

  const TrajectoryIcon = trajectoryIcon;

  const riskColor = getRiskColor(risk.level);
  const riskLevelLabel = getRiskLabel(risk.overall);

  const dominantDriver = useMemo(() => {
    return [...riskDrivers].sort((a, b) => b.value - a.value)[0];
  }, [riskDrivers]);

  const interpretation = useMemo(() => {
    if (
      sensors.rainfall_intensity >= 60 &&
      sensors.soil_moisture >= 75
    ) {
      return "High rainfall combined with elevated soil moisture is increasing environmental pressure on the monitored terrain.";
    }

    if (sensors.rainfall_intensity >= 60) {
      return "Rainfall intensity is currently a significant environmental pressure and should be monitored for further escalation.";
    }

    if (sensors.soil_moisture >= 75) {
      return "Elevated soil moisture indicates increased ground saturation and may contribute to changing slope conditions.";
    }

    return "Current environmental indicators are being monitored continuously for changes in hazard conditions.";
  }, [
    sensors.rainfall_intensity,
    sensors.soil_moisture,
  ]);

  const chartOption = useMemo(() => {
    return {
      animation: true,
      animationDuration: 700,

      grid: {
        top: 28,
        right: 24,
        bottom: 42,
        left: 46,
      },

      tooltip: {
        trigger: "axis",
        backgroundColor: "#0b1727",
        borderColor: "rgba(255,255,255,0.12)",
        textStyle: {
          color: "#e2e8f0",
          fontSize: 12,
        },
        formatter: (
          params: Array<{
            name: string;
            value: number;
          }>
        ) => {
          const point = params[0];

          return `
            <div style="font-size:12px;min-width:120px">
              <div style="color:#64748b;margin-bottom:5px">
                SCENARIO POINT
              </div>

              <div style="font-weight:600;color:#e2e8f0">
                ${point.name}
              </div>

              <div style="margin-top:6px;color:#94a3b8">
                Risk index:
                <strong style="color:${riskColor}">
                  ${point.value}
                </strong>
              </div>
            </div>
          `;
        },
      },

      xAxis: {
        type: "category",
        boundaryGap: false,

        data: [
          "-3h",
          "-2h",
          "-1h",
          "NOW",
          "+1h",
          "+2h",
          "+3h",
        ],

        axisLine: {
          lineStyle: {
            color: "rgba(148,163,184,0.15)",
          },
        },

        axisTick: {
          show: false,
        },

        axisLabel: {
          color: "#64748b",
          fontSize: 10,
        },
      },

      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        interval: 25,

        splitLine: {
          lineStyle: {
            color: "rgba(148,163,184,0.07)",
          },
        },

        axisLine: {
          show: false,
        },

        axisTick: {
          show: false,
        },

        axisLabel: {
          color: "#64748b",
          fontSize: 10,
          formatter: "{value}",
        },
      },

      series: [
        {
          name: "Risk Index",
          type: "line",
          smooth: 0.35,
          data: trajectory,

          symbol: "circle",
          symbolSize: 7,

          lineStyle: {
            width: 3,
            color: riskColor,
          },

          itemStyle: {
            color: riskColor,
            borderColor: "#07111f",
            borderWidth: 2,
          },

          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,

              colorStops: [
                {
                  offset: 0,
                  color:
                    risk.level.toUpperCase() === "CRITICAL"
                      ? "rgba(248,113,113,0.22)"
                      : risk.level.toUpperCase() === "HIGH"
                        ? "rgba(251,146,60,0.20)"
                        : risk.level.toUpperCase() === "MODERATE"
                          ? "rgba(250,204,21,0.16)"
                          : "rgba(52,211,153,0.14)",
                },
                {
                  offset: 1,
                  color: "rgba(7,17,31,0)",
                },
              ],
            },
          },

          markLine: {
            silent: true,
            symbol: "none",

            lineStyle: {
              color: "rgba(248,113,113,0.32)",
              type: "dashed",
              width: 1,
            },

            data: [
              {
                yAxis: 70,
                label: {
                  show: true,
                  formatter: "HIGH",
                  color: "#64748b",
                  fontSize: 9,
                },
              },
            ],
          },
        },
      ],
    };
  }, [risk.level, riskColor, trajectory]);

  return (
    <div>
      {/* =========================================================
          HEADER
      ========================================================= */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-400">
          <Brain className="h-3.5 w-3.5" />
          AI-Assisted Risk Analysis
        </div>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
              AI Forecast & Risk Trajectory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Scenario-based analysis for{" "}
              <span className="text-slate-300">
                {location.village}
              </span>
              , {location.district}
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-wider text-cyan-300">
            <Activity className="h-3 w-3" />
            Prototype Analysis
          </div>
        </div>
      </div>

      {/* =========================================================
          CURRENT ASSESSMENT
      ========================================================= */}
      <div className="mb-5 grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
        {/* Overall */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-5 ${getRiskBackground(
            risk.level
          )}`}
        >
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl"
            style={{
              backgroundColor: riskColor,
              opacity: 0.08,
            }}
          />

          <div className="relative">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Current Assessment
                </div>

                <div className="mt-1 text-sm text-slate-300">
                  {location.village}
                </div>
              </div>

              <Gauge
                className="h-5 w-5"
                style={{ color: riskColor }}
              />
            </div>

            <div className="flex items-end gap-3">
              <div
                className="text-5xl font-bold tracking-tight"
                style={{ color: riskColor }}
              >
                {risk.overall.toFixed(0)}
              </div>

              <div className="pb-1 text-sm text-slate-500">
                / 100
              </div>
            </div>

            <div
              className="mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold"
              style={{
                borderColor: `${riskColor}33`,
                color: riskColor,
                backgroundColor: `${riskColor}0d`,
              }}
            >
              {risk.level}
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              Combined environmental hazard index
            </div>
          </div>
        </div>

        {/* Landslide */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Landslide Component
              </div>

              <div className="mt-1 text-[10px] text-slate-600">
                Terrain hazard assessment
              </div>
            </div>

            <ShieldAlert className="h-5 w-5 text-red-400" />
          </div>

          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-red-300">
              {risk.landslide.toFixed(1)}
              <span className="ml-1 text-sm text-red-300/50">
                %
              </span>
            </div>

            <span className="text-[10px] font-semibold uppercase text-red-300">
              {getRiskLabel(risk.landslide)}
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-red-400 transition-all duration-700"
              style={{
                width: `${clamp(risk.landslide, 0, 100)}%`,
              }}
            />
          </div>

          <div className="mt-3 text-[10px] leading-4 text-slate-600">
            Terrain + rainfall + moisture + historical indicators
          </div>
        </div>

        {/* Flood */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Flood Component
              </div>

              <div className="mt-1 text-[10px] text-slate-600">
                Hydrological hazard assessment
              </div>
            </div>

            <CloudRain className="h-5 w-5 text-cyan-400" />
          </div>

          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-cyan-300">
              {risk.flood.toFixed(1)}
              <span className="ml-1 text-sm text-cyan-300/50">
                %
              </span>
            </div>

            <span className="text-[10px] font-semibold uppercase text-cyan-300">
              {getRiskLabel(risk.flood)}
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-700"
              style={{
                width: `${clamp(risk.flood, 0, 100)}%`,
              }}
            />
          </div>

          <div className="mt-3 text-[10px] leading-4 text-slate-600">
            Rainfall + moisture + historical flood indicators
          </div>
        </div>
      </div>

      {/* =========================================================
          TRAJECTORY + DRIVERS
      ========================================================= */}
      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        {/* Trajectory */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />

                <h3 className="font-semibold text-slate-200">
                  Risk Trajectory
                </h3>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Illustrative scenario around the current risk state
              </p>
            </div>

            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
                trajectoryDirection === "RISING"
                  ? "border-orange-400/20 bg-orange-400/[0.06] text-orange-300"
                  : trajectoryDirection === "DECLINING"
                    ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300"
                    : "border-yellow-400/20 bg-yellow-400/[0.06] text-yellow-300"
              }`}
            >
              <TrajectoryIcon className="h-3.5 w-3.5" />

              {trajectoryDirection}

              {trajectoryChange !== 0 && (
                <span>
                  {trajectoryChange > 0 ? "+" : ""}
                  {trajectoryChange}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.04] bg-[#07111f]/50 px-2 pt-2">
            <ReactECharts
              option={chartOption}
              style={{
                height: "310px",
                width: "100%",
              }}
              opts={{
                renderer: "svg",
              }}
            />
          </div>

          {/* Current position */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-[9px] uppercase tracking-wider text-slate-600">
                Current
              </div>

              <div
                className="mt-1 text-lg font-bold"
                style={{ color: riskColor }}
              >
                {risk.overall.toFixed(1)}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-[9px] uppercase tracking-wider text-slate-600">
                Direction
              </div>

              <div className="mt-1 text-sm font-semibold text-slate-300">
                {trajectoryDirection}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-[9px] uppercase tracking-wider text-slate-600">
                Projection
              </div>

              <div className="mt-1 text-sm font-semibold text-slate-300">
                +3 hours
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-yellow-400/10 bg-yellow-400/[0.025] p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />

              <p className="text-[11px] leading-5 text-slate-500">
                The future portion of this chart is a prototype
                scenario projection based on current conditions. It is{" "}
                <span className="text-slate-300">
                  not a scientifically validated probability forecast
                </span>{" "}
                and does not represent an actual event prediction.
              </p>
            </div>
          </div>
        </div>

        {/* Risk Drivers */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-cyan-400" />

              <h3 className="font-semibold text-slate-200">
                Risk Drivers
              </h3>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Environmental factors contributing to the assessment
            </p>
          </div>

          <div className="space-y-4">
            {riskDrivers.map((driver) => {
              const Icon = driver.icon;
              const state = getDriverState(driver.value);

              return (
                <div
                  key={driver.name}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                        <Icon className="h-4 w-4 text-slate-400" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-300">
                          {driver.name}
                        </div>

                        <div className="mt-0.5 text-[9px] text-slate-600">
                          {driver.description}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-xs font-semibold text-slate-300">
                        {driver.display}
                      </div>

                      <div
                        className={`mt-1 rounded-full border px-2 py-0.5 text-[8px] font-semibold ${state.className}`}
                      >
                        {state.label}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                      style={{
                        width: `${driver.value}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dominant driver */}
          <div className="mt-5 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.025] p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />

              <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-cyan-400">
                Dominant Current Driver
              </div>
            </div>

            <div className="mt-2 text-sm font-semibold text-slate-200">
              {dominantDriver.name}
            </div>

            <div className="mt-1 text-[10px] leading-4 text-slate-500">
              {dominantDriver.description} ·{" "}
              {dominantDriver.display}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          AI INTERPRETATION
      ========================================================= */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06]">
              <Brain className="h-4 w-4 text-cyan-400" />
            </div>

            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-400">
                AI Interpretation
              </div>

              <h3 className="mt-1 font-semibold text-slate-200">
                Current environmental assessment
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {interpretation}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />

            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Assessment Status
            </div>
          </div>

          <div className="text-sm font-semibold text-slate-200">
            Live environmental inputs received
          </div>

          <div className="mt-2 text-[11px] leading-5 text-slate-500">
            Sensor state:{" "}
            <span className="text-emerald-400">
              {sensors.sensor_status}
            </span>
          </div>

          <div className="mt-4 h-px bg-white/[0.06]" />

          <div className="mt-3 flex items-center justify-between text-[10px]">
            <span className="text-slate-600">
              Last sensor update
            </span>

            <span className="text-slate-400">
              {new Date(sensors.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          RESPONSE RECOMMENDATION
      ========================================================= */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.5fr] lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
              <ShieldAlert className="h-4 w-4 text-orange-400" />
              Response Recommendation
            </div>

            <div className="text-lg font-semibold text-slate-200">
              Current response level
            </div>

            <div
              className="mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold"
              style={{
                borderColor: `${riskColor}33`,
                color: riskColor,
                backgroundColor: `${riskColor}0d`,
              }}
            >
              {riskLevelLabel} RISK STATE
            </div>
          </div>

          <div className="rounded-xl border border-orange-400/10 bg-orange-400/[0.025] p-4">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-orange-300">
              SYSTEM RECOMMENDATION
            </div>

            <p className="text-sm leading-6 text-slate-300">
              {risk.overall >= 85
                ? "Initiate emergency evacuation protocol for vulnerable zones."
                : risk.overall >= 70
                  ? "Prepare evacuation of vulnerable zones and response teams."
                  : risk.overall >= 50
                    ? "Increase monitoring and prepare emergency response resources."
                    : recommended_action}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          EXPLAINABILITY PIPELINE
      ========================================================= */}
      <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.025] p-5">
        <div className="flex items-start gap-3">
          <Brain className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

          <div className="w-full">
            <div className="font-semibold text-slate-200">
              How TerraShield reaches this assessment
            </div>

            <div className="mt-1 text-[10px] text-slate-600">
              Explainable intelligence pipeline
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Observe */}
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold uppercase text-cyan-400">
                    01
                  </div>

                  <Activity className="h-3.5 w-3.5 text-cyan-400/60" />
                </div>

                <div className="mt-3 text-xs font-medium text-slate-300">
                  Observe
                </div>

                <div className="mt-1 text-[10px] leading-4 text-slate-600">
                  Sensor and environmental inputs
                </div>
              </div>

              {/* Assess */}
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold uppercase text-cyan-400">
                    02
                  </div>

                  <Gauge className="h-3.5 w-3.5 text-cyan-400/60" />
                </div>

                <div className="mt-3 text-xs font-medium text-slate-300">
                  Assess
                </div>

                <div className="mt-1 text-[10px] leading-4 text-slate-600">
                  Landslide and flood risk indices
                </div>
              </div>

              {/* Project */}
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold uppercase text-cyan-400">
                    03
                  </div>

                  <TrendingUp className="h-3.5 w-3.5 text-cyan-400/60" />
                </div>

                <div className="mt-3 text-xs font-medium text-slate-300">
                  Project
                </div>

                <div className="mt-1 text-[10px] leading-4 text-slate-600">
                  Prototype risk trajectory
                </div>
              </div>

              {/* Respond */}
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.025] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold uppercase text-cyan-400">
                    04
                  </div>

                  <ShieldAlert className="h-3.5 w-3.5 text-cyan-400/60" />
                </div>

                <div className="mt-3 text-xs font-medium text-slate-300">
                  Respond
                </div>

                <div className="mt-1 text-[10px] leading-4 text-slate-600">
                  Recommended action level
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          FOOTNOTE
      ========================================================= */}
      <div className="mt-4 flex items-start gap-2 px-1">
        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-slate-600" />

        <p className="text-[9px] leading-4 text-slate-600">
          TerraShield AI currently presents a prototype risk-assessment
          and scenario-projection workflow. Future trajectory values
          should not be interpreted as validated event probabilities.
        </p>
      </div>
    </div>
  );
}

export default AIForecast;