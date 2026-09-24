import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";

import type { LatLngBoundsExpression } from "leaflet";

import {
  Activity,
  AlertTriangle,
  CloudRain,
  Crosshair,
  Droplets,
  Layers3,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Waves,
} from "lucide-react";

import "leaflet/dist/leaflet.css";

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

interface RiskMapProps {
  locations: Location[];
  selectedLocation: string;
  onSelectLocation: (locationId: string) => void;
}

/* ============================================================
   RISK HELPERS
============================================================ */

function getRiskColor(level: string) {
  switch (level.toUpperCase()) {
    case "CRITICAL":
      return "#ff5d68";

    case "HIGH":
      return "#ff8a00";

    case "MODERATE":
      return "#facc15";

    default:
      return "#00d59f";
  }
}

function getRiskText(level: string) {
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
      return "border-red-500/25 bg-red-500/[0.06]";

    case "HIGH":
      return "border-orange-500/25 bg-orange-500/[0.06]";

    case "MODERATE":
      return "border-yellow-500/25 bg-yellow-500/[0.06]";

    default:
      return "border-emerald-500/25 bg-emerald-500/[0.06]";
  }
}

function getRiskIcon(level: string) {
  switch (level.toUpperCase()) {
    case "CRITICAL":
      return ShieldAlert;

    case "HIGH":
      return AlertTriangle;

    default:
      return ShieldCheck;
  }
}

/* ============================================================
   MAP VIEWPORT
============================================================ */

function MapViewport({
  locations,
}: {
  locations: Location[];
}) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) {
      return;
    }

    const bounds: LatLngBoundsExpression =
      locations.map(
        (location) =>
          [
            location.latitude,
            location.longitude,
          ] as [number, number]
      );

    map.fitBounds(bounds, {
      padding: [55, 55],
      maxZoom: 9,
      animate: true,
    });
  }, [locations, map]);

  return null;
}

/* ============================================================
   SELECTED LOCATION FOCUS
============================================================ */

function MapFocus({
  location,
}: {
  location?: Location;
}) {
  const map = useMap();

  useEffect(() => {
    if (!location) {
      return;
    }

    map.flyTo(
      [
        location.latitude,
        location.longitude,
      ],
      Math.max(map.getZoom(), 9),
      {
        duration: 0.8,
      }
    );
  }, [location, map]);

  return null;
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

function RiskMap({
  locations,
  selectedLocation,
  onSelectLocation,
}: RiskMapProps) {
  const [monitoring, setMonitoring] =
    useState<MonitoringData[]>([]);

  const [networkOnline, setNetworkOnline] =
    useState(true);

  /* ==========================================================
     LIVE MONITORING

     RiskMap independently refreshes its marker intelligence
     every 10 seconds so the map always represents current
     backend telemetry.
  ========================================================== */

  useEffect(() => {
    if (locations.length === 0) {
      return;
    }

    let cancelled = false;

    const fetchMonitoring = async () => {
      try {
        const results = await Promise.all(
          locations.map(async (location) => {
            const response =
              await axios.get<MonitoringData>(
                `${API_BASE}/monitoring/${location.id}`
              );

            return response.data;
          })
        );

        if (!cancelled) {
          setMonitoring(results);
          setNetworkOnline(true);
        }
      } catch (error) {
        console.error(
          "Risk map monitoring fetch failed:",
          error
        );

        if (!cancelled) {
          setNetworkOnline(false);
        }
      }
    };

    fetchMonitoring();

    const interval = window.setInterval(
      fetchMonitoring,
      10000
    );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [locations]);

  /* ==========================================================
     INDEX LIVE DATA
  ========================================================== */

  const monitoringById = useMemo(() => {
    return new Map(
      monitoring.map((item) => [
        item.location.id,
        item,
      ])
    );
  }, [monitoring]);

  /* ==========================================================
     MAP LOCATIONS
  ========================================================== */

  const mapLocations = useMemo(() => {
    return locations.map((location) => {
      const live =
        monitoringById.get(location.id);

      return {
        location,
        live,
        level:
          live?.risk.level ?? "MODERATE",
        risk:
          live?.risk.overall ?? 0,
      };
    });
  }, [locations, monitoringById]);

  /* ==========================================================
     SELECTED LOCATION
  ========================================================== */

  const selectedData = useMemo(() => {
    const location = locations.find(
      (item) =>
        item.id === selectedLocation
    );

    if (!location) {
      return undefined;
    }

    const live =
      monitoringById.get(location.id);

    return {
      location,
      live,
    };
  }, [
    locations,
    monitoringById,
    selectedLocation,
  ]);

  /* ==========================================================
     RISK COUNTS
  ========================================================== */

  const counts = useMemo(() => {
    return {
      critical: mapLocations.filter(
        (item) =>
          item.level.toUpperCase() ===
          "CRITICAL"
      ).length,

      high: mapLocations.filter(
        (item) =>
          item.level.toUpperCase() ===
          "HIGH"
      ).length,

      moderate: mapLocations.filter(
        (item) =>
          item.level.toUpperCase() ===
          "MODERATE"
      ).length,

      low: mapLocations.filter(
        (item) =>
          item.level.toUpperCase() ===
          "LOW"
      ).length,
    };
  }, [mapLocations]);

  const selectedLocationObject =
    selectedData?.location;

  const SelectedRiskIcon =
    selectedData?.live
      ? getRiskIcon(
          selectedData.live.risk.level
        )
      : ShieldCheck;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-400/10 bg-[#08121f] shadow-[0_0_60px_rgba(0,0,0,0.25)]">
      {/* ======================================================
          MAP STYLING
      ====================================================== */}

      <style>{`
        .terrashield-map .leaflet-tile-pane {
          filter:
            brightness(0.68)
            saturate(0.72)
            contrast(1.05)
            hue-rotate(170deg)
            invert(0.88);
        }

        .terrashield-map .leaflet-control-zoom {
          border: 1px solid rgba(255,255,255,0.10) !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25) !important;
        }

        .terrashield-map .leaflet-control-zoom a {
          width: 34px !important;
          height: 34px !important;
          line-height: 34px !important;
          background: rgba(8,18,31,0.92) !important;
          color: #94a3b8 !important;
          border-bottom: 1px solid rgba(255,255,255,0.08) !important;
        }

        .terrashield-map .leaflet-control-zoom a:last-child {
          border-bottom: 0 !important;
        }

        .terrashield-map .leaflet-control-zoom a:hover {
          background: rgba(34,211,238,0.10) !important;
          color: #22d3ee !important;
        }

        .terrashield-map .leaflet-control-attribution {
          background: rgba(8,18,31,0.80) !important;
          color: #64748b !important;
          font-size: 9px !important;
        }

        .terrashield-map .leaflet-control-attribution a {
          color: #67e8f9 !important;
        }

        .terrashield-map .leaflet-popup-content-wrapper,
        .terrashield-map .leaflet-popup-tip {
          background: #0b1727 !important;
          color: #e2e8f0 !important;
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 20px 50px rgba(0,0,0,0.35) !important;
        }

        .terrashield-map .leaflet-popup-content {
          margin: 14px 16px !important;
        }

        .terrashield-map .leaflet-popup-close-button {
          color: #64748b !important;
        }

        .terrashield-map .leaflet-tooltip {
          background: #0b1727 !important;
          border: 1px solid rgba(255,255,255,0.10) !important;
          color: #e2e8f0 !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25) !important;
        }

        .terrashield-map .leaflet-tooltip-top:before {
          border-top-color: #0b1727 !important;
        }

        .terrashield-marker-critical {
          animation: terrashieldPulse 1.8s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes terrashieldPulse {
          0%, 100% {
            opacity: 1;
          }

          50% {
            opacity: 0.62;
          }
        }
      `}</style>

      {/* ======================================================
          MAP
      ====================================================== */}

      <MapContainer
        center={[30.45, 79.45]}
        zoom={8}
        minZoom={6}
        maxZoom={13}
        scrollWheelZoom
        className="terrashield-map h-[610px] w-full bg-[#08121f] sm:h-[660px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapViewport
          locations={locations}
        />

        <MapFocus
          location={
            selectedLocationObject
          }
        />

        {/* ====================================================
            RISK MARKERS
        ==================================================== */}

        {mapLocations.map(
          ({
            location,
            live,
            level,
            risk,
          }) => {
            const isSelected =
              location.id ===
              selectedLocation;

            const color =
              getRiskColor(level);

            const markerRadius =
              isSelected
                ? 13
                : level === "CRITICAL"
                ? 11
                : 9;

            return (
              <CircleMarker
                key={location.id}
                center={[
                  location.latitude,
                  location.longitude,
                ]}
                radius={markerRadius}
                pathOptions={{
                  color: isSelected
                    ? "#ffffff"
                    : color,

                  fillColor: color,

                  fillOpacity:
                    isSelected
                      ? 0.98
                      : 0.88,

                  weight:
                    isSelected ? 3 : 2,

                  className:
                    level.toUpperCase() ===
                    "CRITICAL"
                      ? "terrashield-marker-critical"
                      : undefined,
                }}
                eventHandlers={{
                  click: () =>
                    onSelectLocation(
                      location.id
                    ),
                }}
              >
                {/* HOVER TOOLTIP */}

                <Tooltip
                  direction="top"
                  offset={[0, -8]}
                >
                  <div className="min-w-[150px]">
                    <div className="font-semibold">
                      {location.village}
                    </div>

                    <div className="mt-1 text-[10px] text-slate-400">
                      {location.district}
                    </div>

                    <div
                      className="mt-2 text-[10px] uppercase tracking-wider"
                      style={{
                        color,
                      }}
                    >
                      {level}{" "}
                      {risk.toFixed(0)}%
                    </div>
                  </div>
                </Tooltip>

                {/* CLICK POPUP */}

                <Popup>
                  <div className="min-w-[210px]">
                    <div className="mb-1 text-base font-semibold">
                      {location.village}
                    </div>

                    <div className="text-xs text-slate-400">
                      {location.district},{" "}
                      {location.state}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">
                        Risk index
                      </span>

                      <span
                        className="text-lg font-bold"
                        style={{
                          color,
                        }}
                      >
                        {live?.risk.overall.toFixed(
                          1
                        ) ?? "—"}
                        %
                      </span>
                    </div>

                    <div
                      className="mt-2 text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        color,
                      }}
                    >
                      {level}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          }
        )}
      </MapContainer>

      {/* ======================================================
          TOP LEFT — MAP IDENTITY
      ====================================================== */}

      <div className="pointer-events-none absolute left-5 top-5 z-[500] rounded-2xl border border-cyan-400/15 bg-[#091523]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/20">
            <Activity className="h-5 w-5 text-cyan-400" />
          </div>

          <div>
            <div className="text-[9px] uppercase tracking-[0.22em] text-slate-500">
              Geospatial Intelligence
            </div>

            <div className="mt-1 text-sm font-semibold text-slate-100">
              Uttarakhand Risk Network
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          TOP RIGHT — NETWORK STATUS
      ====================================================== */}

      <div className="pointer-events-none absolute right-5 top-5 z-[500] w-56 rounded-2xl border border-white/10 bg-[#091523]/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
            Network Status
          </div>

          <Radio className="h-3.5 w-3.5 text-emerald-400" />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-slate-100">
              {locations.length}
            </div>

            <div className="mt-1 text-[10px] text-slate-500">
              monitored locations
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-sm font-bold text-emerald-400">
              <span
                className={`h-2 w-2 rounded-full ${
                  networkOnline
                    ? "animate-pulse bg-emerald-400"
                    : "bg-red-400"
                }`}
              />

              {monitoring.length}
            </div>

            <div className="mt-1 text-[9px] text-slate-600">
              sensors online
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          RIGHT — RISK DISTRIBUTION
      ====================================================== */}

      <div className="pointer-events-none absolute right-5 top-[145px] z-[500] w-56 rounded-2xl border border-white/10 bg-[#091523]/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2">
          <Layers3 className="h-3.5 w-3.5 text-orange-400" />

          <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
            Risk Distribution
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Critical
            </span>

            <span className="text-xs font-semibold text-red-400">
              {counts.critical}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              High
            </span>

            <span className="text-xs font-semibold text-orange-400">
              {counts.high}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              Moderate
            </span>

            <span className="text-xs font-semibold text-yellow-400">
              {counts.moderate}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Low
            </span>

            <span className="text-xs font-semibold text-emerald-400">
              {counts.low}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================
          BOTTOM RIGHT — SELECTED LOCATION
      ====================================================== */}

      {selectedData && (
        <div className="absolute bottom-5 right-5 z-[500] w-[265px] rounded-2xl border border-white/10 bg-[#091523]/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
                Selected Location
              </div>

              <div className="mt-2 text-base font-semibold text-slate-100">
                {
                  selectedData
                    .location.village
                }
              </div>

              <div className="mt-1 text-xs text-slate-500">
                {
                  selectedData
                    .location.district
                }
              </div>
            </div>

            <SelectedRiskIcon
              className={`h-5 w-5 ${
                selectedData.live
                  ? getRiskText(
                      selectedData.live
                        .risk.level
                    )
                  : "text-cyan-400"
              }`}
            />
          </div>

          {/* RISK INDEX */}

          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-slate-600">
                Risk Index
              </div>

              <div
                className={`mt-1 text-3xl font-bold ${
                  selectedData.live
                    ? getRiskText(
                        selectedData.live
                          .risk.level
                      )
                    : "text-slate-300"
                }`}
              >
                {selectedData.live
                  ? selectedData.live.risk.overall.toFixed(
                      1
                    )
                  : "—"}
              </div>
            </div>

            {selectedData.live && (
              <span
                className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${getRiskBorder(
                  selectedData.live.risk.level
                )} ${getRiskText(
                  selectedData.live.risk.level
                )}`}
              >
                {
                  selectedData.live.risk
                    .level
                }
              </span>
            )}
          </div>

          {/* LIVE CONDITIONS */}

          {selectedData.live && (
            <>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-white/[0.035] p-2.5">
                  <CloudRain className="mb-1.5 h-3.5 w-3.5 text-cyan-400" />

                  <div className="text-sm font-semibold text-slate-200">
                    {selectedData.live.sensors.rainfall_intensity.toFixed(
                      1
                    )}
                  </div>

                  <div className="text-[8px] text-slate-600">
                    mm/hr
                  </div>
                </div>

                <div className="rounded-lg bg-white/[0.035] p-2.5">
                  <Droplets className="mb-1.5 h-3.5 w-3.5 text-blue-400" />

                  <div className="text-sm font-semibold text-slate-200">
                    {selectedData.live.sensors.soil_moisture.toFixed(
                      1
                    )}
                    %
                  </div>

                  <div className="text-[8px] text-slate-600">
                    soil
                  </div>
                </div>

                <div className="rounded-lg bg-white/[0.035] p-2.5">
                  <Waves className="mb-1.5 h-3.5 w-3.5 text-orange-400" />

                  <div className="text-sm font-semibold text-slate-200">
                    {selectedData.live.sensors.slope.toFixed(
                      1
                    )}
                    °
                  </div>

                  <div className="text-[8px] text-slate-600">
                    slope
                  </div>
                </div>
              </div>

              {/* SENSOR STATUS */}

              <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-400/10 bg-emerald-400/[0.035] px-3 py-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <Radio className="h-3.5 w-3.5 text-emerald-400" />

                  Sensor network
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  {
                    selectedData.live
                      .sensors
                      .sensor_status
                  }
                </div>
              </div>
            </>
          )}

          <button
            onClick={() =>
              onSelectLocation(
                selectedData.location.id
              )
            }
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.035] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 transition hover:bg-cyan-400/[0.08]"
          >
            <Crosshair className="h-3.5 w-3.5" />

            Location selected
          </button>
        </div>
      )}

      {/* ======================================================
          BOTTOM LEFT — LEGEND
      ====================================================== */}

      <div className="pointer-events-none absolute bottom-5 left-5 z-[500] rounded-2xl border border-white/10 bg-[#091523]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
        <div className="mb-2 text-[9px] uppercase tracking-[0.2em] text-slate-500">
          Risk Level
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <span className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Critical
          </span>

          <span className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            High
          </span>

          <span className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            Moderate
          </span>

          <span className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Low
          </span>
        </div>
      </div>
    </div>
  );
}

export default RiskMap;