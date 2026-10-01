"""Independent actual-BRep checks of authored visual proxies, never physical fit.

Does not import the generator, its cost functions or its geometry metadata.
"""
import argparse
import json
import math
from pathlib import Path

import cadquery as cq
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.GeomAbs import GeomAbs_Cylinder, GeomAbs_Plane
from OCP.BRepClass3d import BRepClass3d_SolidClassifier
from OCP.TopAbs import TopAbs_IN, TopAbs_OUT
from OCP.gp import gp_Pnt
from ...contracts import Invalid, load, write

TOL = 1e-6  # authored model agreement, not source/physical dimensional accuracy


def expected_bounds(d, p):
    k = d["recipe"]
    if k == "screw":
        r = p["headDiameter"]/2
        return [-r, -r, -p["headHeight"], r, r, p["length"]]
    if k == "standoff":
        r = p["diameter"]/2
        return [-r, -r, 0, r, r, p["length"]+p["extensionLength"]]
    if k == "washer":
        r = p["outerDiameter"]/2
        return [-r, -r, 0, math.sqrt(r*r-p["gapWidth"]**2/4) if p["gapWidth"] else r, r, p["thickness"]]
    if k == "nut":
        radius = p["acrossFlats"]/math.sqrt(3)
        return [-radius, -p["acrossFlats"]/2, 0, radius, p["acrossFlats"]/2, p["height"]]
    if k == "rivet":
        r = p["headDiameter"]/2
        return [-r, -r, -p["headHeight"], r, r, p["stemLength"]+p["pinLift"]+p["pinLength"]]
    if k == "motor":
        return [0, 0 if d["semanticRole"] == "left" else -p["shaftExtension"], 0,
                p["length"]+p["canLength"], p["width"]+p["shaftExtension"] if d["semanticRole"] == "left" else p["width"], p["height"]]
    if k == "servo":
        return [(p["length"]-p["tabLength"])/2, 0, 0, (p["length"]+p["tabLength"])/2,
                p["width"], p["height"]+p["bossHeight"]+p["shaftHeight"]]
    if k == "horn":
        left = -p["hubRadius"] if d["semanticRole"] == "steering" else -p["width"]/2
        return [left, -p["hubRadius"], 0, p["length"]+p["width"]/2, p["hubRadius"], p["hubHeight"]]
    if k == "wheel":
        r = p["radius"]
        return [-r, -r, 0, r, r, p["width"]]
    if k == "board":
        return [0, 0, 0, p["length"], p["width"], p["thickness"]+max(p["headerHeight"], p["portHeight"])]
    if k == "hat":
        return [0, 0, 0, p["length"], p["width"], p["thickness"]+max(p["connectorHeight"], p["speakerHeight"])]
    if k == "camera":
        return [0, 0, 0, p["length"], p["width"], p["thickness"]+p["lensHeight"]]
    if k == "ultrasonic":
        return [0, 0, 0, p["length"], p["width"], p["thickness"]+p["transducerHeight"]]
    if k == "grayscale":
        return [0, 0, -p["sensorHeight"], p["length"], p["width"], p["thickness"]+p["connectorHeight"]]
    if k == "battery":
        return [0, 0, 0, p["length"], p["width"], p["height"]]
    if k == "connector":
        return [0, 0, 0, p["length"]+p["plugLength"], p["width"], p["height"]]
    raise Invalid("INDEPENDENT_BOUNDS_PROFILE_UNSUPPORTED")


def inspect(d, directory):
    p = {a["name"]: a["value"] for a in d["instructionalApproximations"]}
    ident, kind = d["definitionId"], d["recipe"]
    brep = Path(directory) / (ident+".brep")
    if kind in ("schematic", "abstract"):
        if brep.exists():
            raise Invalid("UNEXPECTED_SOLID_FOR_SCHEMATIC_OR_ABSTRACT")
        doc = load(Path(directory) / (ident+".schematic.json"))
        if doc["track"] != "instructional-only" or doc["rigidSolidCount"] != 0 or doc["metricRoute"]:
            raise Invalid("ZERO_SOLID_REPRESENTATION")
        endpoints = d["protectedFacts"]["cable"]["endpointConnectorRefs"] if kind == "schematic" else []
        if doc["definitionId"] != ident or doc["endpointConnectorRefs"] != endpoints:
            raise Invalid("ENDPOINT_IDENTITY_MUTATION")
        return {"definitionId": ident, "status": "PASS", "solidCount": 0,
                "scope": "Explicit zero-solid representation", "engineeringAdmission": False}
    actual = cq.Shape.importBrep(str(brep))
    solids = actual.Solids()
    if not BRepCheck_Analyzer(actual.wrapped).IsValid() or len(solids) != d["expectedRigidSolids"]:
        raise Invalid("ACTUAL_BREP_VALIDITY_OR_SOLID_COUNT")
    if any(not BRepCheck_Analyzer(s.wrapped).IsValid() or s.Volume() <= 0 for s in solids):
        raise Invalid("INVALID_OR_ZERO_VOLUME_SOLID")
    b = Bnd_Box()
    BRepBndLib.AddOptimal_s(actual.wrapped, b, False, False)
    bounds = list(b.Get())
    expected = expected_bounds(d, p)
    if max(abs(a-e) for a, e in zip(bounds, expected)) > TOL:
        raise Invalid("AUTHORED_SHAPE_BOUNDS_OR_UNITS")
    cylinders, plane_wires = [], []
    for face in actual.Faces():
        adapter = BRepAdaptor_Surface(face.wrapped, True)
        if adapter.GetType() == GeomAbs_Cylinder:
            c = adapter.Cylinder()
            cylinders.append({"radius": c.Radius(), "point": list(c.Axis().Location().Coord()), "direction": list(c.Axis().Direction().Coord())})
        elif adapter.GetType() == GeomAbs_Plane:
            plane_wires.append(len(face.Wires()))

    def radius(r):
        if not any(abs(c["radius"]-r) < TOL for c in cylinders):
            raise Invalid("MISSING_ACTUAL_CYLINDRICAL_FEATURE")

    def hole(r, x, y):
        if not any(abs(c["radius"]-r) < TOL and abs(c["point"][0]-x) < TOL and abs(c["point"][1]-y) < TOL and abs(abs(c["direction"][2])-1) < TOL for c in cylinders):
            raise Invalid("MISSING_OR_MOVED_ACTUAL_HOLE")

    if kind == "screw":
        radius(p["diameter"]/2)
        radius(p["headDiameter"]/2)
    if kind == "standoff":
        radius(p["diameter"]/2)
        if p["extensionLength"]:
            radius(p["extensionDiameter"]/2)
    if kind in ("washer", "nut"):
        radius(p["boreDiameter"]/2)
    if kind == "rivet":
        radius(p["pinDiameter"]/2)
        if not any(len(f.Wires()) > 1 for f in solids[0].Faces()):
            raise Invalid("RIVET_BODY_PIN_FEATURES")
    if kind == "motor":
        radius(p["canRadius"])
        radius(p["shaftRadius"])
        if not any(abs(c["radius"]-p["shaftRadius"]) < TOL and abs(c["point"][0]-p["shaftX"]) < TOL and abs(abs(c["direction"][1])-1) < TOL for c in cylinders):
            raise Invalid("MOTOR_SHAFT_SIDE")
    if kind == "servo":
        radius(p["bossRadius"])
        radius(p["shaftRadius"])
        for x in ((p["length"]-p["tabLength"])/4, p["length"]+(p["tabLength"]-p["length"])/4):
            hole(p["holeRadius"], x, p["width"]/2)
    if kind == "horn":
        hole(p["boreRadius"], 0 if d["semanticRole"] == "steering" else p["length"]/2, 0)
        for x in ([p["length"]] if d["semanticRole"] == "steering" else [0, p["length"]]):
            hole(p["tipBoreRadius"], x, 0)
    if kind == "wheel":
        radius(p["radius"])
        # Boolean fuses may partition coplanar faces. Counting wires on one
        # face is insufficient: classify actual material and void in every
        # spoke sector, independently of the generator's Boolean topology.
        radial = (p["hubRadius"]+p["innerRadius"])/2
        for i in range(int(p["spokeCount"])):
            for offset, expected_state in ((0, TopAbs_IN), (.5, TopAbs_OUT)):
                a = (i+offset)*2*math.pi/p["spokeCount"]
                state = BRepClass3d_SolidClassifier(solids[0].wrapped, gp_Pnt(radial*math.cos(a), radial*math.sin(a), p["width"]/2), TOL).State()
                if state != expected_state:
                    raise Invalid("WHEEL_SPOKE_WINDOWS_OR_BORE_MISSING")
        if BRepClass3d_SolidClassifier(solids[0].wrapped, gp_Pnt(0, 0, p["width"]/2), TOL).State() != TopAbs_OUT:
            raise Invalid("WHEEL_BORE_MISSING")
        if ident.endswith("FRONT"):
            radius(p["boreRadius"])
        elif any(abs(c["radius"]-p["boreRadius"]) < TOL for c in cylinders):
            raise Invalid("REAR_SQUARE_BORE_PRESENTATION_SUBSTITUTED")
    if kind == "board":
        for x in (p["mountOffset"], p["mountOffset"]+p["mountX"]):
            for y in (p["mountOffset"], p["mountOffset"]+p["mountY"]):
                hole(p["holeRadius"], x, y)
    if kind in ("camera", "ultrasonic"):
        for x in (p["mountOffset"], p["length"]-p["mountOffset"]):
            for y in (p["mountOffset"], p["width"]-p["mountOffset"]):
                hole(p["holeRadius"], x, y)
        if kind == "camera":
            radius(p["lensRadius"])
        else:
            for x in (p["length"]*.25, p["length"]*.75):
                hole(p["transducerBore"], x, p["width"]/2)
    if kind == "grayscale":
        for x in (p["mountOffset"], p["length"]-p["mountOffset"]):
            hole(p["holeRadius"], x, p["width"]/2)
    return {"definitionId": ident, "status": "PASS", "scope": "Actual authored proxy BRep only; not metrology/fit",
            "solidCount": len(solids), "valid": True, "volumeMm3": actual.Volume(), "boundsMm": bounds,
            "cylindricalFeatureCount": len(cylinders), "maxPlanarWireCount": max(plane_wires, default=0),
            "featureChecks": "Actual surfaces/holes inspected independently of generator metadata",
            "unit": "mm", "engineeringAdmission": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--parameters", required=True)
    parser.add_argument("--artifacts", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    try:
        out = Path(args.output)
        if out.exists():
            raise Invalid("NEW_REPORT_REQUIRED")
        source = load(args.parameters)
        if source["track"] != "instructional-only" or source["unit"] != "mm":
            raise Invalid("TRACK_UNITS")
        leads = load(Path(args.artifacts) / "integral-leads.schematic.json")
        if leads["leads"] != source["integralLeads"] or leads["rigidSolidCount"] != 0 or leads["metricRoute"] or leads["purchasedItemIncrement"] != 0:
            raise Invalid("INTEGRAL_LEAD_OWNERSHIP_OR_ZERO_SOLID")
        results = [inspect(d, args.artifacts) for d in sorted(source["definitions"], key=lambda d: d["definitionId"])]
        report = {"status": "PASS", "gate": "G-INSTRUCTIONAL-COMPONENT-SHAPE", "results": results, "engineeringAdmission": False}
        write(out, report)
        print(json.dumps({"status": "PASS", "definitions": len(results), "engineeringAdmission": False}))
        return 0
    except (Invalid, ValueError, KeyError, TypeError) as error:
        print(json.dumps({"status": "FAIL", "reason": str(error)}))
        return 1
    except Exception as error:
        print(json.dumps({"status": "TOOL_FAILURE", "reason": str(error)}))
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
