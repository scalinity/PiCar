"""Negative identity/rights guards for the pinned vendor candidate inspector."""
import pytest
import os

from twin_cad.contracts import Invalid
from twin_cad.vendor.pi5_candidate import source_check


def test_generic_candidate_cannot_replace_pinned_pi5(tmp_path):
    step = tmp_path / "generic.step"
    license_file = tmp_path / "LICENSE.txt"
    step.write_bytes(b"ISO-10303-21; GENERIC_BOARD; END-ISO-10303-21;")
    license_file.write_bytes(b"Unverified generic source")
    with pytest.raises(Invalid, match="CANDIDATE_SOURCE_SUBSTITUTION"):
        source_check(step, license_file)


def test_source_changes_reject_before_cad_import(tmp_path, monkeypatch):
    import builtins
    from twin_cad.vendor.pi5_candidate import inspect
    step = tmp_path / "modified.step"
    license_file = tmp_path / "LICENSE.txt"
    step.write_bytes(b"ISO-10303-21; MILLIMETRE_BOARD; END-ISO-10303-21;")
    license_file.write_bytes(b"MIT")
    original = builtins.__import__

    def forbidden_cad(name, *args, **kwargs):
        if name == "cadquery":
            raise AssertionError("Unbound candidate reached CAD import")
        return original(name, *args, **kwargs)

    monkeypatch.setattr(builtins, "__import__", forbidden_cad)
    with pytest.raises(Invalid, match="CANDIDATE_SOURCE_SUBSTITUTION"):
        inspect(step, license_file)


def test_accurate_source_cannot_discard_its_license(tmp_path):
    step = os.environ["PICAR_M5_CANDIDATE_STEP"]
    license_file = tmp_path / "replacement-license.txt"
    license_file.write_bytes(b"MIT without the source limitations")
    with pytest.raises(Invalid, match="LICENSE_BINDING_CHANGED"):
        source_check(step, license_file)
