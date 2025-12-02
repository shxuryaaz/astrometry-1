import { NextResponse } from "next/server";
import type { KundliProfile } from "@/lib/types";

// Map Prokerala planet names to internal format
const normalizePlanetName = (name: string): string => {
  const planetMap: Record<string, string> = {
    sun: "Sun",
    surya: "Sun",
    moon: "Moon",
    chandra: "Moon",
    mars: "Mars",
    mangal: "Mars",
    mercury: "Mercury",
    budh: "Mercury",
    jupiter: "Jupiter",
    guru: "Jupiter",
    brihaspati: "Jupiter",
    venus: "Venus",
    shukra: "Venus",
    saturn: "Saturn",
    shani: "Saturn",
    rahu: "Rahu",
    ketu: "Ketu",
  };

  const normalized = name.toLowerCase().trim();
  return planetMap[normalized] || name;
};

// Map Prokerala sign names to internal format
const normalizeSignName = (name: string): string => {
  const signMap: Record<string, string> = {
    aries: "Aries",
    mesha: "Aries",
    taurus: "Taurus",
    vrishabha: "Taurus",
    vrishab: "Taurus",
    gemini: "Gemini",
    mithuna: "Gemini",
    mithun: "Gemini",
    cancer: "Cancer",
    karka: "Cancer",
    kark: "Cancer",
    leo: "Leo",
    simha: "Leo",
    singh: "Leo",
    virgo: "Virgo",
    kanya: "Virgo",
    libra: "Libra",
    tula: "Libra",
    scorpio: "Scorpio",
    vrischika: "Scorpio",
    vrishchik: "Scorpio",
    sagittarius: "Sagittarius",
    dhanus: "Sagittarius",
    dhanu: "Sagittarius",
    capricorn: "Capricorn",
    makara: "Capricorn",
    makar: "Capricorn",
    aquarius: "Aquarius",
    kumbha: "Aquarius",
    kumbh: "Aquarius",
    pisces: "Pisces",
    meena: "Pisces",
    mina: "Pisces",
  };

  const normalized = name.toLowerCase().trim();
  return signMap[normalized] || name;
};

async function getAccessToken() {
  const clientId = process.env.PROKERALA_CLIENT_ID;
  const clientSecret = process.env.PROKERALA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Prokerala credentials (PROKERALA_CLIENT_ID / PROKERALA_CLIENT_SECRET)");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch("https://api.prokerala.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await res.json();

  if (!res.ok || !data.access_token) {
    console.error("[Kundli] Token Error:", data);
    throw new Error("Failed to fetch access token");
  }

  return data.access_token as string;
}

function extractPlanets(raw: any): any[] {
  if (!raw) return [];

  const candidates =
    raw?.output?.planet_position ??
    raw?.output?.planetary_positions ??
    raw?.data?.planetary_positions ??
    raw?.data?.planet_positions ??
    raw?.data?.planet_positions?.planet_position ??
    raw?.data?.planet_position ??
    raw?.output?.planet_positions?.planet_position ??
    raw?.data?.planets ??
    raw?.planetary_positions ??
    raw?.planet_position ??
    raw?.planets ??
    [];

  return Array.isArray(candidates) ? candidates : [];
}

export async function POST(req: Request) {
  try {
    const {
      name = "Guest",
      gender = "Unknown",
      dob,
      tob,
      pob = "Unknown",
      datetime,
      coordinates,
      ayanamsa = 1,
      timezone = "+05:30",
      latitude,
      longitude,
    } = await req.json();

    const hasDirectDatetime = typeof datetime === "string" && datetime.length > 0;
    const hasDobTob = typeof dob === "string" && typeof tob === "string";

    if (!hasDirectDatetime && !hasDobTob) {
      return NextResponse.json(
        { error: "Provide either datetime or dob + tob" },
        { status: 400 },
      );
    }

    const isoDatetime = hasDirectDatetime
      ? datetime
      : `${dob}T${tob}:00${timezone}`;

    const coords =
      coordinates ||
      (latitude && longitude ? `${latitude},${longitude}` : null) ||
      "28.5355,77.3910"; // Default to Noida/Delhi

    const accessToken = await getAccessToken();

    const query = new URLSearchParams({
      datetime: isoDatetime,
      coordinates: coords,
      ayanamsa: String(ayanamsa),
    }).toString();

    const endpointOrder = [
      "https://api.prokerala.com/v2/astrology/advanced-kundli",
      "https://api.prokerala.com/v2/astrology/planet-position",
    ];

    let kundliData: any = null;
    let planetsRaw: any[] = [];
    let lastError: any = null;

    for (const endpoint of endpointOrder) {
      try {
        const url = `${endpoint}?${query}`;
        const kundliRes = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const json = await kundliRes.json();

        if (!kundliRes.ok) {
          lastError = json;
          console.warn(`[Kundli] Endpoint ${endpoint} failed`, json);
          continue;
        }

        const extracted = extractPlanets(json);

        if (extracted.length) {
          kundliData = json;
          planetsRaw = extracted;
          console.log(`[Kundli] Using endpoint ${endpoint} with ${extracted.length} planets`);
          break;
        }

        lastError = {
          error: "No planetary positions in response",
          endpoint,
          raw: json,
        };
      } catch (error) {
        lastError = { error: "Request failed", details: error };
        console.error(`[Kundli] Request error for endpoint ${endpoint}`, error);
      }
    }

    if (!kundliData || !planetsRaw.length) {
      console.error("[Kundli] Unable to fetch planetary positions", lastError);
      return NextResponse.json(
        {
          error: "No planetary positions returned",
          details: lastError,
        },
        { status: 502 },
      );
    }

    const kundliPlanets = planetsRaw.map((p: any) => ({
      planet: normalizePlanetName(p.name || p.planet || ""),
      sign: normalizeSignName(p.rasi?.name || p.sign || ""),
      house: Number(p.house || p.house_number || p.bhava || 0),
      degree: p.degree || p.longitude || p.lon,
    }));

    const profile: KundliProfile = {
      name,
      gender,
      dob: hasDobTob ? dob : "Unknown",
      tob: hasDobTob ? tob : "Unknown",
      pob,
      planets: kundliPlanets,
      raw: kundliData,
    };

    return NextResponse.json({ profile });
  } catch (err: any) {
    console.error("[Kundli Route Error]", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 },
    );
  }
}

