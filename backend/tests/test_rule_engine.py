import pytest
from app.services.rule_engine import rule_engine

def test_potato_chips_rule_envelope():
    """Potato chips (aw=0.20, fat=34%) must trigger strict WVTR, strict OTR, and light barrier."""
    barrier = rule_engine.calculate_barrier_envelope(
        moisture_pct=2.0,
        fat_pct=34.0,
        ph=5.8,
        water_activity=0.20,
        respiration_rate=0.0,
        is_respiring=False,
        temperature_c=25.0,
        relative_humidity_pct=65.0,
        target_shelf_life_days=180
    )
    # WVTR should be <= 2.5 g/m²·day
    assert barrier.max_wvtr_g_m2_day <= 2.5
    # OTR should be <= 30 cc/m²·day·atm
    assert barrier.max_otr_cc_m2_day <= 30.0
    # Light barrier must be required
    assert barrier.light_barrier_required is True
    # MAP / N2 flush should be recommended
    assert barrier.map_required is True

def test_strawberries_produce_rule_envelope():
    """Fresh strawberries (respiring) must NEVER have airtight barrier; requires high OTR/permeability."""
    barrier = rule_engine.calculate_barrier_envelope(
        moisture_pct=91.0,
        fat_pct=0.3,
        ph=3.4,
        water_activity=0.98,
        respiration_rate=60.0,
        is_respiring=True,
        temperature_c=4.0,
        relative_humidity_pct=90.0,
        target_shelf_life_days=7
    )
    # Must allow high gas transmission to avoid anaerobic fermentation
    assert barrier.max_otr_cc_m2_day >= 3000.0
    assert barrier.map_required is True
    assert "Equilibrium MAP" in barrier.recommended_map_gas
