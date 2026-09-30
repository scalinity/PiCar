"""Installable M4 authoring CLI. Exit 0 pass, 1 invalid, 2 blocked, 3 tool error."""
import argparse
import importlib.metadata
import json
from pathlib import Path
import sys

from .contracts import Blocked, Invalid, check_source, input_digest, load, write


def production_report(declarations):
    return {"status": "BLOCKED", "scope": "production", "blockerIds": sorted({b for d in declarations["definitions"] for b in d["blockerIds"]}),
            "definitions": declarations["definitions"], "productionDatum": declarations["productionDatum"],
            "generatedSolids": 0, "instructionalReleaseAllowed": False}


def build(source, output, start_seed=0):
    from .geometry import export_definition
    from .solver import solve
    check_source(source)
    # Solve completely before creating output; contradictory input never releases a partial pack.
    solutions = [solve(a, start_seed) for a in sorted(source["assemblies"], key=lambda a: a["id"])]
    out = Path(output)
    if out.exists() and any(out.iterdir()):
        raise Invalid("OUTPUT_NOT_EMPTY")
    out.mkdir(parents=True, exist_ok=True)
    definitions = [export_definition(d, out) for d in sorted(source["definitions"], key=lambda d: d["id"])]
    write(out / "solutions.json", {"scope": "TEST-ONLY", "fixtureInputHash": input_digest(source),
                                   "instanceDefinitions": sorted(source["instances"], key=lambda i: i["id"]), "solutions": solutions})
    write(out / "fingerprints.json", {"scope": "TEST-ONLY", "fixtureInputHash": input_digest(source), "definitions": definitions})
    return {"status": "PASS", "scope": "TEST-ONLY", "definitions": len(definitions), "assemblies": len(solutions),
            "productionAdmission": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("verb", choices=["build", "verify", "lint", "environment"])
    parser.add_argument("--fixture", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--start-seed", type=int, default=0)
    parser.add_argument("--variant", choices=["rpi4", "rpi5", "rpi-zero-2-w"])
    parser.add_argument("--profile", choices=["nominal"], default="nominal")
    parser.add_argument("--declarations", type=Path, default=Path(__file__).with_name("production-parameters.json"))
    parser.add_argument("--allow-unresolved", action="store_true")
    args = parser.parse_args()
    try:
        if args.verb == "environment":
            import OCP
            report = {"status": "PASS", "python": sys.version.split()[0], "ocpRuntime": OCP.__version__,
                      "versions": {n: importlib.metadata.version(n) for n in ["twin-cad", "cadquery", "cadquery-ocp", "numpy", "scipy", "rfc8785"]}}
        elif args.fixture is None:
            report = production_report(load(args.declarations))
            print(json.dumps(report))
            return 0 if args.verb == "lint" and args.allow_unresolved else 2
        else:
            source = load(args.fixture)
            check_source(source)
            if args.verb == "lint":
                report = {"status": "PASS", "scope": "TEST-ONLY", "instructionalReleaseAllowed": False}
            elif args.output is None:
                raise Invalid("OUTPUT_REQUIRED")
            elif args.verb == "build":
                report = build(source, args.output, args.start_seed)
            else:
                from .verification import verify
                report = verify(source, args.output)
                write(args.output / "independent-verification.json", report)
        print(json.dumps(report))
        return 0
    except Blocked as error:
        print(json.dumps({"status": "BLOCKED", "reason": str(error), "generatedSolids": 0}))
        return 2
    except (Invalid, json.JSONDecodeError, KeyError, TypeError) as error:
        print(json.dumps({"status": "FAIL", "reason": str(error)}))
        return 1
    except Exception as error:
        print(json.dumps({"status": "TOOL_FAILURE", "type": type(error).__name__, "reason": str(error)}))
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
