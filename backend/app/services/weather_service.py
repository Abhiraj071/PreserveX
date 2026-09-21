import logging
from typing import Dict, Any, Optional
import httpx

logger = logging.getLogger(__name__)

INDIAN_CLIMATE_DEFAULTS = {
    "indore": {"temp": 31.5, "rh": 65.0, "temp_min": 22.0, "temp_max": 36.5, "rh_min": 42.0, "rh_max": 82.0, "risk_condition": "Moderate Heat / Variable Humidity"},
    "mumbai": {"temp": 30.0, "rh": 82.0, "temp_min": 26.0, "temp_max": 33.0, "rh_min": 70.0, "rh_max": 92.0, "risk_condition": "High Coastal Humidity Stress"},
    "delhi": {"temp": 33.5, "rh": 55.0, "temp_min": 24.0, "temp_max": 39.0, "rh_min": 35.0, "rh_max": 75.0, "risk_condition": "High Thermal Stress / Dry-Humid Fluctuation"},
    "bengaluru": {"temp": 26.0, "rh": 62.0, "temp_min": 19.0, "temp_max": 30.0, "rh_min": 48.0, "rh_max": 78.0, "risk_condition": "Mild Temperate Ambient"},
    "bangalore": {"temp": 26.0, "rh": 62.0, "temp_min": 19.0, "temp_max": 30.0, "rh_min": 48.0, "rh_max": 78.0, "risk_condition": "Mild Temperate Ambient"},
    "chennai": {"temp": 33.0, "rh": 78.0, "temp_min": 27.0, "temp_max": 37.0, "rh_min": 65.0, "rh_max": 88.0, "risk_condition": "Tropical Heat & High Marine Humidity"},
    "kolkata": {"temp": 32.0, "rh": 80.0, "temp_min": 25.0, "temp_max": 36.0, "rh_min": 60.0, "rh_max": 92.0, "risk_condition": "Hot & Humid Monsoonal Exposure"},
    "ahmedabad": {"temp": 35.0, "rh": 50.0, "temp_min": 24.0, "temp_max": 41.0, "rh_min": 30.0, "rh_max": 70.0, "risk_condition": "Extreme Thermal Oxidation Risk"},
    "jaipur": {"temp": 34.0, "rh": 48.0, "temp_min": 22.0, "temp_max": 40.0, "rh_min": 28.0, "rh_max": 68.0, "risk_condition": "Arid Heat / Low Atmospheric Moisture"},
    "pune": {"temp": 28.5, "rh": 65.0, "temp_min": 20.0, "temp_max": 33.0, "rh_min": 50.0, "rh_max": 80.0, "risk_condition": "Moderate Ambient Conditions"},
    "hyderabad": {"temp": 31.0, "rh": 60.0, "temp_min": 23.0, "temp_max": 36.0, "rh_min": 45.0, "rh_max": 75.0, "risk_condition": "Plateau Moderate-High Heat"},
    "lucknow": {"temp": 32.5, "rh": 62.0, "temp_min": 23.0, "temp_max": 38.0, "rh_min": 45.0, "rh_max": 80.0, "risk_condition": "Subtropical Continental Heat"},
    "kochi": {"temp": 30.5, "rh": 84.0, "temp_min": 25.0, "temp_max": 33.0, "rh_min": 72.0, "rh_max": 95.0, "risk_condition": "High Moisture Condensation Risk"},
    "shimla": {"temp": 16.0, "rh": 52.0, "temp_min": 10.0, "temp_max": 22.0, "rh_min": 40.0, "rh_max": 70.0, "risk_condition": "Cold Mountain Ambient"}
}

class WeatherReferenceService:
    """
    Provides ambient environmental weather reference data for user storage analysis.
    Uses Open-Meteo free API with 24-hour forecast range (min/max) and instant regional climate database fallback.
    """

    async def get_weather_reference(self, location: str) -> Dict[str, Any]:
        clean_loc = location.strip()
        loc_key = clean_loc.lower()

        # Try live geocoding + current & hourly forecast via Open-Meteo (public, no key required)
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={clean_loc}&count=1&language=en&format=json"
                geo_resp = await client.get(geo_url)
                if geo_resp.status_code == 200:
                    geo_data = geo_resp.json()
                    results = geo_data.get("results", [])
                    if results:
                        lat = results[0]["latitude"]
                        lon = results[0]["longitude"]
                        city_name = results[0].get("name", clean_loc)
                        country = results[0].get("country", "")
                        
                        # Request current weather AND next 24h hourly forecast to derive thermal range
                        weather_url = (
                            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
                            f"&current=temperature_2m,relative_humidity_2m"
                            f"&hourly=temperature_2m,relative_humidity_2m&forecast_days=1"
                        )
                        w_resp = await client.get(weather_url)
                        if w_resp.status_code == 200:
                            w_data = w_resp.json()
                            curr = w_data.get("current", {})
                            temp = curr.get("temperature_2m")
                            rh = curr.get("relative_humidity_2m")
                            
                            hourly = w_data.get("hourly", {})
                            temps_24h = hourly.get("temperature_2m", [])
                            rhs_24h = hourly.get("relative_humidity_2m", [])
                            
                            temp_min = min(temps_24h) if temps_24h else (temp - 5.0 if temp else 20.0)
                            temp_max = max(temps_24h) if temps_24h else (temp + 5.0 if temp else 35.0)
                            rh_min = min(rhs_24h) if rhs_24h else (rh - 15.0 if rh else 40.0)
                            rh_max = max(rhs_24h) if rhs_24h else (rh + 15.0 if rh else 80.0)

                            # Classify environmental stress condition
                            risk_condition = self._classify_stress_condition(temp, rh, temp_max, rh_max)

                            if temp is not None and rh is not None:
                                return {
                                    "location": f"{city_name}{', ' + country if country else ''}",
                                    "temperature_c": round(float(temp), 1),
                                    "relative_humidity_pct": round(float(rh), 0),
                                    "forecast_24h": {
                                        "temp_min": round(float(temp_min), 1),
                                        "temp_max": round(float(temp_max), 1),
                                        "rh_min": round(float(rh_min), 0),
                                        "rh_max": round(float(rh_max), 0)
                                    },
                                    "risk_condition": risk_condition,
                                    "source": "OPEN_METEO_API",
                                    "status": "LIVE_HOURLY",
                                    "type": "environmental_reference",
                                    "note": "Live ambient weather reference. Warehouse / cold storage conditions should be set as intended."
                                }
        except Exception as e:
            logger.info(f"Live weather lookup for {clean_loc} bypassed ({e}), using regional climate baseline.")

        # Fallback to curated regional climate baseline
        baseline = INDIAN_CLIMATE_DEFAULTS.get(loc_key, {
            "temp": 28.0, "rh": 60.0, "temp_min": 21.0, "temp_max": 35.0, "rh_min": 45.0, "rh_max": 78.0,
            "risk_condition": "Standard Subtropical Ambient"
        })
        
        return {
            "location": clean_loc.capitalize() or "Regional Average",
            "temperature_c": baseline["temp"],
            "relative_humidity_pct": baseline["rh"],
            "forecast_24h": {
                "temp_min": baseline.get("temp_min", baseline["temp"] - 5),
                "temp_max": baseline.get("temp_max", baseline["temp"] + 5),
                "rh_min": baseline.get("rh_min", baseline["rh"] - 15),
                "rh_max": baseline.get("rh_max", baseline["rh"] + 15)
            },
            "risk_condition": baseline.get("risk_condition", "Regional Climate Baseline"),
            "source": "REGIONAL_CLIMATE_REFERENCE",
            "status": "REFERENCE",
            "type": "environmental_reference",
            "note": "Regional climate reference fallback baseline."
        }

    def _classify_stress_condition(self, temp: float, rh: float, temp_max: float, rh_max: float) -> str:
        if temp_max >= 38.0 and rh >= 70.0:
            return "Extreme Hot & Humid (High Kinetic Degradation)"
        if temp_max >= 37.0:
            return "Thermal Stress / Oxidation Acceleration"
        if rh_max >= 85.0:
            return "High Moisture / Mold Vulnerability"
        if temp <= 10.0:
            return "Cold Ambient / Chilled Stability"
        return "Moderate Ambient Exposure"

weather_service = WeatherReferenceService()
