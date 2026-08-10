"use strict";

window.Visibility = (() => {
  const DEGREE = Math.PI / 180;

  function radians(value) {
    return value * DEGREE;
  }

  function degrees(value) {
    return value / DEGREE;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function normaliseDegrees(value) {
    return ((value % 360) + 360) % 360;
  }

  function normaliseHours(value) {
    return normaliseDegrees(value * 15) / 15;
  }

  function julianDate(date) {
    return date.getTime() / 86400000 + 2440587.5;
  }

  function greenwichSiderealDegrees(date) {
    const jd = julianDate(date);
    const centuries = (jd - 2451545.0) / 36525;
    return normaliseDegrees(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * centuries ** 2 - centuries ** 3 / 38710000);
  }

  function localSiderealHours(date, longitude) {
    return normaliseHours((greenwichSiderealDegrees(date) + longitude) / 15);
  }

  function formatClock(hours) {
    const minutes = Math.round(normaliseHours(hours) * 60) % 1440;
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  }

  function formatUtcClock(date) {
    return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
  }

  function equatorialFromEcliptic(longitude, latitude, days) {
    const obliquity = radians(23.4393 - 3.563e-7 * days);
    const eclipticLongitude = radians(longitude);
    const eclipticLatitude = radians(latitude);
    const rightAscension = Math.atan2(
      Math.sin(eclipticLongitude) * Math.cos(obliquity) - Math.tan(eclipticLatitude) * Math.sin(obliquity),
      Math.cos(eclipticLongitude),
    );
    const declination = Math.asin(Math.sin(eclipticLatitude) * Math.cos(obliquity) + Math.cos(eclipticLatitude) * Math.sin(obliquity) * Math.sin(eclipticLongitude));
    return { ra: normaliseDegrees(degrees(rightAscension)), dec: degrees(declination) };
  }

  function eccentricAnomaly(meanAnomaly, eccentricity) {
    const mean = radians(meanAnomaly);
    let anomaly = mean + eccentricity * Math.sin(mean) * (1 + eccentricity * Math.cos(mean));
    for (let iteration = 0; iteration < 6; iteration += 1) {
      anomaly -= (anomaly - eccentricity * Math.sin(anomaly) - mean) / (1 - eccentricity * Math.cos(anomaly));
    }
    return anomaly;
  }

  function solarCoordinates(date) {
    const days = julianDate(date) - 2451543.5;
    const perihelion = 282.9404 + 4.70935e-5 * days;
    const eccentricity = 0.016709 - 1.151e-9 * days;
    const meanAnomaly = normaliseDegrees(356.047 + 0.9856002585 * days);
    const anomaly = eccentricAnomaly(meanAnomaly, eccentricity);
    const x = Math.cos(anomaly) - eccentricity;
    const y = Math.sqrt(1 - eccentricity ** 2) * Math.sin(anomaly);
    return equatorialFromEcliptic(normaliseDegrees(degrees(Math.atan2(y, x)) + perihelion), 0, days);
  }

  function lunarCoordinates(date) {
    const days = julianDate(date) - 2451543.5;
    const ascendingNode = normaliseDegrees(125.1228 - 0.0529538083 * days);
    const inclination = 5.1454;
    const perihelion = normaliseDegrees(318.0634 + 0.1643573223 * days);
    const semiMajorAxis = 60.2666;
    const eccentricity = 0.0549;
    const meanAnomaly = normaliseDegrees(115.3654 + 13.0649929509 * days);
    const anomaly = eccentricAnomaly(meanAnomaly, eccentricity);
    const xOrbital = semiMajorAxis * (Math.cos(anomaly) - eccentricity);
    const yOrbital = semiMajorAxis * Math.sqrt(1 - eccentricity ** 2) * Math.sin(anomaly);
    const trueAnomaly = degrees(Math.atan2(yOrbital, xOrbital));
    const radius = Math.sqrt(xOrbital ** 2 + yOrbital ** 2);
    const node = radians(ascendingNode);
    const orbit = radians(trueAnomaly + perihelion);
    const tilt = radians(inclination);
    const x = radius * (Math.cos(node) * Math.cos(orbit) - Math.sin(node) * Math.sin(orbit) * Math.cos(tilt));
    const y = radius * (Math.sin(node) * Math.cos(orbit) + Math.cos(node) * Math.sin(orbit) * Math.cos(tilt));
    const z = radius * Math.sin(orbit) * Math.sin(tilt);
    const longitude = normaliseDegrees(degrees(Math.atan2(y, x)));
    const latitude = degrees(Math.atan2(z, Math.hypot(x, y)));
    return equatorialFromEcliptic(longitude, latitude, days);
  }

  function altitudeDegrees(coordinates, date, longitude, latitude) {
    const hourAngle = radians(normaliseDegrees(greenwichSiderealDegrees(date) + longitude - coordinates.ra + 180) - 180);
    const observerLatitude = radians(latitude);
    const declination = radians(coordinates.dec);
    return degrees(Math.asin(Math.sin(observerLatitude) * Math.sin(declination) + Math.cos(observerLatitude) * Math.cos(declination) * Math.cos(hourAngle)));
  }

  function angularDistanceDegrees(first, second) {
    const firstDeclination = radians(first.dec);
    const secondDeclination = radians(second.dec);
    const deltaRightAscension = radians(first.ra - second.ra);
    return degrees(Math.acos(clamp(Math.sin(firstDeclination) * Math.sin(secondDeclination) + Math.cos(firstDeclination) * Math.cos(secondDeclination) * Math.cos(deltaRightAscension), -1, 1)));
  }

  function twilightDetails(solarAltitude) {
    if (solarAltitude >= 0) return { label: "Day", shade: "#242424" };
    if (solarAltitude >= -6) return { label: "Civil twilight", shade: "#5d5d5d" };
    if (solarAltitude >= -12) return { label: "Nautical twilight", shade: "#999999" };
    if (solarAltitude >= -18) return { label: "Astronomical twilight", shade: "#d2d2d2" };
    return { label: "Night", shade: "#ffffff" };
  }

  function observerHorizonDegrees(elevation) {
    return -0.0293 * Math.sqrt(Math.max(0, elevation));
  }

  function timeZoneOffsetHours(timeZone, time) {
    const formatter = new Intl.DateTimeFormat("en-GB", { timeZone, timeZoneName: "longOffset" });
    const label = formatter.formatToParts(time).find((part) => part.type === "timeZoneName")?.value || "GMT";
    const match = label.match(/^GMT(?:(\+|-)(\d{1,2})(?::?(\d{2}))?)?$/);
    if (!match || !match[1]) return 0;
    const offset = Number(match[2]) + Number(match[3] || 0) / 60;
    return match[1] === "-" ? -offset : offset;
  }

  async function resolveTimeZone(settings) {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({ latitude: String(settings.latitude), longitude: String(settings.longitude), timezone: "auto", forecast_days: "1" });
    const response = await fetch(url);
    if (!response.ok) throw new Error("Could not determine timezone for this location.");
    const payload = await response.json();
    if (!payload.timezone) throw new Error("No timezone was returned for this location.");
    return {
      timeZone: payload.timezone,
      utcOffset: timeZoneOffsetHours(payload.timezone, new Date(Date.UTC(settings.year, settings.month - 1, settings.day, 16))),
    };
  }

  function withTimeZone(settings, timeZone) {
    return {
      ...settings,
      ...timeZone,
      start: new Date(Date.UTC(settings.year, settings.month - 1, settings.day) - timeZone.utcOffset * 3600000),
    };
  }

  function buildData(settings, coordinate, targetName) {
    if (!coordinate || (coordinate[0] === 0 && coordinate[1] === 0)) throw new Error("This target has no usable sky coordinate.");
    const target = { ra: coordinate[0], dec: coordinate[1] };
    const points = [];
    const startHour = 16;
    const endHour = 32;
    const start = new Date(settings.start.getTime() + startHour * 3600000);
    for (let minute = 0; minute <= (endHour - startHour) * 60; minute += 5) {
      const time = new Date(start.getTime() + minute * 60000);
      const sun = solarCoordinates(time);
      const moon = lunarCoordinates(time);
      const sunAltitude = altitudeDegrees(sun, time, settings.longitude, settings.latitude);
      points.push({
        hour: startHour + minute / 60,
        time,
        localTime: formatClock(startHour + minute / 60),
        utcTime: formatUtcClock(time),
        siderealTime: formatClock(localSiderealHours(time, settings.longitude)),
        altitude: altitudeDegrees(target, time, settings.longitude, settings.latitude),
        sunAltitude,
        twilight: twilightDetails(sunAltitude),
        moonAltitude: altitudeDegrees(moon, time, settings.longitude, settings.latitude),
        moonDistance: angularDistanceDegrees(target, moon),
      });
    }
    return { settings, target, targetName, points };
  }

  function twilightShapes(points) {
    const shapes = [];
    let start = points[0].hour;
    let twilight = points[0].twilight;
    for (let index = 1; index < points.length; index += 1) {
      if (points[index].twilight.shade === twilight.shade) continue;
      shapes.push({ type: "rect", xref: "x", yref: "paper", x0: start, x1: points[index].hour, y0: 0, y1: 1, fillcolor: twilight.shade, line: { width: 0 }, layer: "below" });
      start = points[index].hour;
      twilight = points[index].twilight;
    }
    shapes.push({ type: "rect", xref: "x", yref: "paper", x0: start, x1: points.at(-1).hour, y0: 0, y1: 1, fillcolor: twilight.shade, line: { width: 0 }, layer: "below" });
    return shapes;
  }

  function visibilityTicks(data) {
    const tickValues = Array.from({ length: 9 }, (_, index) => 16 + index * 2);
    return {
      tickvals: tickValues,
      ticktext: tickValues.map((hour) => {
        const point = data.points[(hour - 16) * 12];
        return `${point.localTime}<br>UT ${point.utcTime}<br>LST ${point.siderealTime}`;
      }),
    };
  }

  function airmassAxis(range) {
    const masses = [1, 1.1, 1.25, 1.5, 2, 3, 4, 5, 10];
    return {
      title: "Airmass (1 / cos z)",
      overlaying: "y",
      side: "right",
      range,
      tickvals: masses.map((mass) => degrees(Math.asin(1 / mass))),
      ticktext: masses.map((mass) => String(mass)),
      showgrid: false,
      zeroline: false,
    };
  }

  function renderChart(chart, data, showMoon) {
    if (!window.Plotly) return false;
    const { points, settings, targetName } = data;
    const targetAltitudes = points.map((point) => point.altitude);
    const lowestVisible = -10;
    const horizon = observerHorizonDegrees(settings.elevation);
    const traces = [
      {
        x: points.map((point) => point.hour), y: targetAltitudes, type: "scatter", mode: "lines", name: targetName,
        line: { color: "#0b4f8a", width: 3 }, customdata: points.map((point) => [point.localTime, point.utcTime, point.siderealTime, point.twilight.label]),
        hovertemplate: "Local %{customdata[0]}<br>UT %{customdata[1]}<br>LST %{customdata[2]}<br>Altitude %{y:.1f}°<br>%{customdata[3]}<extra>Target</extra>",
      },
      {
        x: [16, 32], y: [horizon, horizon], type: "scatter", mode: "lines", name: settings.elevation > 0 ? `Visible horizon (${horizon.toFixed(1)}°)` : "Horizon (0°)",
        line: { color: "#333", width: 1.25, dash: "dash" }, hovertemplate: "Visible horizon %{y:.1f}°<extra></extra>",
      },
    ];
    if (showMoon) {
      traces.push({
        x: points.map((point) => point.hour), y: points.map((point) => point.moonAltitude), type: "scatter", mode: "lines+text", name: "Moon · labels show separation",
        line: { color: "#9a4e00", width: 1.75, dash: "dot" }, text: points.map((point, index) => index % 24 === 0 && point.moonAltitude > horizon ? `${point.moonDistance.toFixed(0)}°` : ""),
        textposition: "top center", textfont: { color: "#7b3c00", size: 10 }, customdata: points.map((point) => [point.localTime, point.utcTime, point.siderealTime, point.moonDistance]),
        hovertemplate: "Local %{customdata[0]}<br>UT %{customdata[1]}<br>LST %{customdata[2]}<br>Moon altitude %{y:.1f}°<br>Target separation %{customdata[3]:.1f}°<extra>Moon</extra>",
      });
    }
    const layout = {
      autosize: true, margin: { l: 68, r: 78, t: 28, b: 102 }, paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "#ffffff", font: { color: "#1f2933" },
      xaxis: { range: [16, 32], title: "Local time<br><span style=\"font-size:10px\">UT · local sidereal time</span>", ...visibilityTicks(data), tickfont: { size: 10 }, gridcolor: "rgba(0,0,0,.18)", zeroline: false },
      yaxis: { range: [lowestVisible, 90], title: "Altitude (°)", dtick: 10, gridcolor: "rgba(0,0,0,.2)", zeroline: false }, yaxis2: airmassAxis([lowestVisible, 90]),
      legend: { orientation: "h", yanchor: "bottom", y: 1.02, xanchor: "left", x: 0, bgcolor: "rgba(255,255,255,.72)" }, shapes: twilightShapes(points), hovermode: "x unified", showlegend: true,
    };
    window.Plotly.react(chart, traces, layout, { responsive: true, displaylogo: false, modeBarButtonsToRemove: ["lasso2d", "select2d"] });
    return true;
  }

  return Object.freeze({ resolveTimeZone, withTimeZone, buildData, renderChart });
})();
