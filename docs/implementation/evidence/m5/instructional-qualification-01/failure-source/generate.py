"""Generate purchased tutorial proxies only; no assembly, mesh or engineering datum.

All offsets/proportional subdivisions below are authored presentation construction,
not measured interfaces. Parameter receipts and recipe bytes bind these choices.
"""
import argparse
import hashlib
import html
import json
from pathlib import Path

import cadquery as cq
from ...contracts import Invalid, load, write


def box(l, w, h, x=0, y=0, z=0):
    return cq.Solid.makeBox(l, w, h, cq.Vector(x, y, z))


def cylinder(radius, length, x=0, y=0, z=0, direction=(0, 0, 1)):
    return cq.Solid.makeCylinder(radius, length, cq.Vector(x, y, z), cq.Vector(*direction))


def ring(outer, inner, height, x=0, y=0, z=0):
    return cylinder(outer, height, x, y, z).cut(cylinder(inner, height+2, x, y, z-1))


def compound(parts):
    return cq.Compound.makeCompound(parts)


def make_proxy(d):
    p = {a["name"]: a["value"] for a in d["instructionalApproximations"]}
    if any(a["nonEngineering"] is not True for a in d["instructionalApproximations"]):
        raise Invalid("PRESENTATION_FLAG_REQUIRED")
    kind = d["recipe"]
    if kind in ("schematic", "abstract"):
        return None
    if kind == "screw":
        return cylinder(p["diameter"]/2, p["length"]).fuse(cylinder(p["headDiameter"]/2, p["headHeight"], z=-p["headHeight"]))
    if kind == "standoff":
        result = cylinder(p["diameter"]/2, p["length"])
        if p["extensionLength"]:
            result = result.fuse(cylinder(p["extensionDiameter"]/2, p["extensionLength"], z=p["length"]))
        return result
    if kind == "washer":
        result = ring(p["outerDiameter"]/2, p["boreDiameter"]/2, p["thickness"])
        if p["gapWidth"]:
            result = result.cut(box(p["outerDiameter"], p["gapWidth"], p["thickness"]+2, 0, -p["gapWidth"]/2, -1))
        return result
    if kind == "nut":
        result = cq.Workplane("XY").polygon(6, p["acrossFlats"]*2/(3**.5)).extrude(p["height"]).val()
        return result.cut(cylinder(p["boreDiameter"]/2, p["height"]+2, z=-1))
    if kind == "rivet":
        body = cylinder(p["diameter"]/2, p["stemLength"]).fuse(cylinder(p["headDiameter"]/2, p["headHeight"], z=-p["headHeight"]))
        body = body.cut(cylinder(p["pinDiameter"]/2, p["stemLength"]+p["headHeight"]+2, z=-p["headHeight"]-1))
        pin = cylinder(p["pinDiameter"]/2, p["pinLength"], z=p["stemLength"]+p["pinLift"])
        return compound([body, pin])  # two owned subnodes, one inventory definition
    if kind == "motor":
        shaft_y, direction = (p["width"], (0, 1, 0)) if d["semanticRole"] == "left" else (0, (0, -1, 0))
        return compound([box(p["length"], p["width"], p["height"]),
                         cylinder(p["canRadius"], p["canLength"], p["length"], p["width"]/2, p["height"]/2, (1, 0, 0)),
                         cylinder(p["shaftRadius"], p["shaftExtension"], p["shaftX"], shaft_y, p["height"]/2, direction)])
    if kind == "servo":
        l, w, h = p["length"], p["width"], p["height"]
        result = box(l, w, h).fuse(box(p["tabLength"], w, p["tabThickness"], (l-p["tabLength"])/2, 0, h*.15))
        result = result.fuse(cylinder(p["bossRadius"], p["bossHeight"], p["shaftX"], w/2, h))
        result = result.fuse(cylinder(p["shaftRadius"], p["shaftHeight"], p["shaftX"], w/2, h+p["bossHeight"]))
        for x in ((l-p["tabLength"])/4, l+(p["tabLength"]-l)/4):
            result = result.cut(cylinder(p["holeRadius"], h+2, x, w/2, -1))
        return result
    if kind == "horn":
        l, w, t = p["length"], p["width"], p["thickness"]
        result = box(l, w, t, y=-w/2).fuse(cylinder(w/2, t)).fuse(cylinder(w/2, t, x=l))
        hub_x = 0 if d["semanticRole"] == "steering" else l/2
        result = result.fuse(cylinder(p["hubRadius"], p["hubHeight"], hub_x))
        result = result.cut(cylinder(p["boreRadius"], p["hubHeight"]+2, hub_x, z=-1))
        for x in ([l] if d["semanticRole"] == "steering" else [0, l]):
            result = result.cut(cylinder(p["tipBoreRadius"], p["hubHeight"]+2, x, z=-1))
        return result
    if kind == "wheel":
        result = ring(p["radius"], p["innerRadius"], p["width"])
        result = result.fuse(cylinder(p["hubRadius"], p["width"]))
        for i in range(int(p["spokeCount"])):
            spoke = box(p["innerRadius"], p["spokeWidth"], p["width"], y=-p["spokeWidth"]/2).rotate((0, 0, 0), (0, 0, 1), i*360/p["spokeCount"])
            result = result.fuse(spoke)
        if d["definitionId"].endswith("REAR"):
            r = p["boreRadius"]
            return result.cut(box(r*2, r*2, p["width"]+2, -r, -r, -1))
        return result.cut(cylinder(p["boreRadius"], p["width"]+2, z=-1))
    if kind == "board":
        l, w, t = p["length"], p["width"], p["thickness"]
        pcb = box(l, w, t)
        for x in (p["mountOffset"], p["mountOffset"]+p["mountX"]):
            for y in (p["mountOffset"], p["mountOffset"]+p["mountY"]):
                pcb = pcb.cut(cylinder(p["holeRadius"], t+2, x, y, -1))
        header = box(l*.6, w*.07, p["headerHeight"], l*.08, w*.85, t)
        if d["boardVariant"] == "rpi-zero-2-w":
            ports = [box(l*.17, w*.17, p["portHeight"], l*x, 0, t) for x in (.1, .5, .75)]
        else:
            order = (.05, .38, .7) if d["boardVariant"] == "rpi4" else (.7, .38, .05)
            ports = [box(l*.2, w*(.29 if i == 0 else .25), p["portHeight"]*(.9 if i == 0 else 1), l*.8, w*y, t) for i, y in enumerate(order)]
            ports.append(box(l*.09, w*.08, t*2, l*.2, 0, t))
        camera_positions = [.34, .47] if d["boardVariant"] == "rpi5" else [.65]
        ports.extend(box(l*.06, w*.24, t*2, l*x, w*.2, t) for x in camera_positions)
        return compound([pcb, header, *ports])
    if kind == "hat":
        l, w, t = p["length"], p["width"], p["thickness"]
        # Source labels accompany schematic groups; positions never define pin maps.
        positions = [(l*x, w*.87) for x in (.38, .52, .66, .8)] + [(l*.88, w*y) for y in (.55, .72, .18)] + [(l*x, 0) for x in (.4, .6)]
        ports = [box(l*.09, w*.1, p["connectorHeight"], x, y, t) for x, y in positions]
        return compound([box(l, w, t), cylinder(p["speakerRadius"], p["speakerHeight"], l*.22, w*.45, t), *ports])
    if kind == "camera":
        l, w, t = p["length"], p["width"], p["thickness"]
        result = box(l, w, t).fuse(cylinder(p["lensRadius"], p["lensHeight"], l/2, w/2, t))
        for x in (p["mountOffset"], l-p["mountOffset"]):
            for y in (p["mountOffset"], w-p["mountOffset"]):
                result = result.cut(cylinder(p["holeRadius"], t+2, x, y, -1))
        return result
    if kind == "ultrasonic":
        l, w, t = p["length"], p["width"], p["thickness"]
        result = box(l, w, t)
        for x in (l*.25, l*.75):
            result = result.fuse(ring(p["transducerRadius"], p["transducerBore"], p["transducerHeight"], x, w/2, t))
        for x in (p["mountOffset"], l-p["mountOffset"]):
            for y in (p["mountOffset"], w-p["mountOffset"]):
                result = result.cut(cylinder(p["holeRadius"], t+2, x, y, -1))
        return result
    if kind == "grayscale":
        l, w, t = p["length"], p["width"], p["thickness"]
        pcb = box(l, w, t)
        for x in (p["mountOffset"], l-p["mountOffset"]):
            pcb = pcb.cut(cylinder(p["holeRadius"], t+2, x, w/2, -1))
        sensors = [box(p["sensorLength"], p["sensorWidth"], p["sensorHeight"], l*x-p["sensorLength"]/2, w*.2, -p["sensorHeight"]) for x in (1/6, .5, 5/6)]
        return compound([pcb, *sensors, box(l*.1, w*.4, p["connectorHeight"], l*.75, w*.5, t)])
    if kind == "battery":
        return box(p["length"], p["width"], p["height"])
    if kind == "connector":
        return compound([box(p["length"], p["width"], p["height"]), box(p["plugLength"], p["width"], p["height"]*.6, p["length"], 0, p["height"]*.2)])
    raise Invalid("UNSUPPORTED_PROXY_RECIPE")


def generate(source_path, output):
    source = load(source_path)
    if source.get("track") != "instructional-only" or source["unit"] != "mm" or source["basis"] != "RH-XFORWARD-YLEFT-ZUP":
        raise Invalid("INSTRUCTIONAL_TRACK_UNITS_REQUIRED")
    out = Path(output)
    if out.exists():
        raise Invalid("NEW_OUTPUT_REQUIRED")
    out.mkdir(parents=True)
    records = []
    for d in sorted(source["definitions"], key=lambda d: d["definitionId"]):
        if d["track"] != "instructional-only" or d["engineeringStatus"] == "ENGINEERING_ADMITTED":
            raise Invalid("STRICT_PROOF_REQUIRED_NOT_AVAILABLE_IN_THIS_GENERATOR")
        ident = d["definitionId"]
        solid = make_proxy(d)
        paths = []
        if solid is not None:
            brep = out / (ident+".brep")
            solid.exportBrep(str(brep))
            paths.append(brep.name)
            svg = cq.exporters.getSVG(solid, {"projectionDir": (1, -1, 1), "width": 420, "height": 300, "showAxes": False, "showHidden": False})
        else:
            endpoints = d["protectedFacts"]["cable"]["endpointConnectorRefs"] if d["recipe"] == "schematic" else []
            text = " / ".join(endpoints) if endpoints else "Stock/allocation abstraction; no rigid envelope"
            svg = '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="180"><text x="10" y="70">'+html.escape(text)+'</text></svg>'
            schematic = out / (ident+".schematic.json")
            write(schematic, {"definitionId": ident, "track": "instructional-only", "representationKind": d["representationKind"], "rigidSolidCount": 0, "endpointConnectorRefs": endpoints, "metricRoute": False, "engineeringAdmission": False})
            paths.append(schematic.name)
        # Original private image pixels, vendor artwork and geometry are never copied.
        label = html.escape(d["protectedFacts"]["definition"]["name"])
        svg = svg.replace('</svg>', '<text x="10" y="20" font-size="12">'+label+'</text><text x="10" y="38" font-size="10">Instructional proxy; not engineering geometry</text></svg>')
        (out / (ident+".svg")).write_text(svg)
        paths.append(ident+".svg")
        records.append({"definitionId": ident, "track": "instructional-only", "engineeringStatus": d["engineeringStatus"], "artifactNames": paths, "engineeringAdmission": False, "sourceHash": hashlib.sha256(Path(source_path).read_bytes()).hexdigest()})
    write(out / "integral-leads.schematic.json", {"track": "instructional-only", "leads": source["integralLeads"], "rigidSolidCount": 0, "metricRoute": False, "purchasedItemIncrement": 0, "engineeringAdmission": False})
    write(out / "generation.json", {"track": "instructional-only", "definitions": records, "engineeringAdmission": False, "meshesGenerated": 0, "assemblySolutionsGenerated": 0})
    return {"status": "PASS", "track": "instructional-only", "definitions": len(records), "engineeringAdmission": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--parameters", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    try:
        print(json.dumps(generate(args.parameters, args.output)))
        return 0
    except (Invalid, ValueError, KeyError, TypeError) as error:
        print(json.dumps({"status": "FAIL", "reason": str(error)}))
        return 1
    except Exception as error:
        print(json.dumps({"status": "TOOL_FAILURE", "reason": str(error)}))
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
