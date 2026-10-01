"""Inspect the acquired official Pi5 candidate without generating kit geometry.

Source geometry is for guidance, may be outdated and has no accuracy guarantee.
This module does not assign a production datum, physical IDs or named interfaces.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re

from ..contracts import Blocked, Invalid, write

STEP_SHA256 = "78164070c1cc7ab854382950d2e85926c6e35432f1e5a146b733397a7c6afb44"
LICENSE_SHA256 = "4ca2d350552b24137e55587e13fb09a249b757c6af49652ff02ea524d154c7fc"
LIMITATIONS = [
    "Source is guidance only, without guarantee of accuracy.",
    "Source may not reflect the current product version.",
    "Source requires manufacturer information and physical measurements for fitment.",
    "Supplied board revision/header/cooler configuration is unestablished.",
    "No source-supported production datum, polarity or roll is established.",
    "Solid ownership and mechanical/cosmetic omissions are unclassified.",
]


def source_check(step, license_file):
    data = Path(step).read_bytes()
    license_bytes = Path(license_file).read_bytes()
    if hashlib.sha256(data).hexdigest() != STEP_SHA256:
        raise Invalid("CANDIDATE_SOURCE_SUBSTITUTION")
    if hashlib.sha256(license_bytes).hexdigest() != LICENSE_SHA256:
        raise Invalid("LICENSE_BINDING_CHANGED")
    # Examine all declared STEP length units before passing any bytes to OCCT.
    units = re.findall(r"#[0-9]+\s*=\s*\(\s*LENGTH_UNIT\(\).*?;", data.decode("ascii"), re.S)
    if not units or any("SI_UNIT(.MILLI.,.METRE.)" not in u for u in units):
        raise Blocked("UNSUPPORTED_SOURCE_UNITS")
    return {"stepRawSha256": STEP_SHA256, "stepBytes": len(data),
            "licenseRawSha256": LICENSE_SHA256, "licenseBytes": len(license_bytes),
            "declaredLengthUnit": "mm", "lengthUnitDeclarations": len(units)}


def inspect(step, license_file):
    bindings = source_check(step, license_file)
    import cadquery as cq
    from OCP.BRepCheck import BRepCheck_Analyzer
    from OCP.BRepAdaptor import BRepAdaptor_Surface
    from OCP.GeomAbs import GeomAbs_Cylinder, GeomAbs_Plane

    source_shape = cq.importers.importStep(str(step)).val()
    solids = source_shape.Solids()
    diagnostics = []
    for ordinal, solid in enumerate(solids):
        # These are properties of actual imported topology, not STEP display names.
        types = {}
        cylinders = []
        for face in solid.Faces():
            adaptor = BRepAdaptor_Surface(face.wrapped, True)
            kind = adaptor.GetType()
            name = "plane" if kind == GeomAbs_Plane else "cylinder" if kind == GeomAbs_Cylinder else str(kind)
            types[name] = types.get(name, 0) + 1
            if kind == GeomAbs_Cylinder:
                cylinder = adaptor.Cylinder()
                axis = cylinder.Axis()
                cylinders.append({"radiusMm": cylinder.Radius(),
                                  "axisPointMm": [axis.Location().X(), axis.Location().Y(), axis.Location().Z()],
                                  "axisDirection": [axis.Direction().X(), axis.Direction().Y(), axis.Direction().Z()]})
        box = solid.BoundingBox()
        diagnostics.append({"sourceSolidOrdinal": ordinal, "classification": "UNRESOLVED",
                            "valid": BRepCheck_Analyzer(solid.wrapped).IsValid(),
                            "volumeMm3": solid.Volume(), "faceCount": len(solid.Faces()),
                            "surfaceTypeCounts": types,
                            "occtDiagnosticBoundsMm": [box.xmin, box.ymin, box.zmin, box.xmax, box.ymax, box.zmax],
                            "cylindricalSurfaceDiagnostics": cylinders})
    return {"status": "BLOCKED", "gate": "G-COMPONENT", "scope": "Official Pi5 candidate inspection only",
            "sourceBindings": bindings, "sourceShapeValid": BRepCheck_Analyzer(source_shape.wrapped).IsValid(),
            "coordinateScope": "Vendor source coordinates only; no mapping to canonical PiCar CAD frame admitted",
            "importedSolidCount": len(solids), "validImportedSolidCount": sum(d["valid"] for d in diagnostics),
            "solids": diagnostics, "sourceLimitations": LIMITATIONS,
            "blockerIds": ["Q-10"], "generatedProductionSolids": 0,
            "productionDatum": {"state": "unresolved"}, "productionAdoption": False,
            "meshDeviation": {"state": "notApplicable", "reason": "No mesh generated or certified"},
            "engineeringFeatures": {"state": "unresolved", "reason": "Diagnostic topology is not applicable feature evidence"},
            "inventoryItemIncrement": 0,
            "rights": {"license": "MIT", "noticePreservationRequired": True, "publicationPerformed": False},
            "boundsPolicy": "OCCT bounds are diagnostics only; not dimension/clearance certificates"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--step", required=True, type=Path)
    parser.add_argument("--license", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    if args.output.exists():
        parser.error("Output must be new; retain prior evidence")
    try:
        report = inspect(args.step, args.license)
        write(args.output, report)
        print(json.dumps({k: report[k] for k in ["status", "scope", "importedSolidCount", "validImportedSolidCount", "generatedProductionSolids"]}))
        return 2
    except Blocked as error:
        print(json.dumps({"status": "BLOCKED", "reason": str(error), "generatedProductionSolids": 0}))
        return 2
    except (Invalid, ValueError) as error:
        print(json.dumps({"status": "FAIL", "reason": str(error)}))
        return 1
    except Exception as error:
        print(json.dumps({"status": "TOOL_FAILURE", "reason": str(error)}))
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
