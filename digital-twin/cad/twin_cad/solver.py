"""Small float64 rigid fixture solver. Physical constraints and coordinate gauges differ."""
import numpy as np
from scipy.optimize import least_squares
from scipy.spatial.transform import Rotation

from .contracts import Invalid, frame, pose, runtime_pose


def solve(assembly, start_seed=0):
    ids = sorted(assembly["instanceIds"])
    moving = [i for i in ids if i != assembly["anchor"]]
    anchor = frame(assembly["anchorPose"])

    def poses(x):
        result = {assembly["anchor"]: anchor}
        for n, ident in enumerate(moving):
            m = np.eye(4)
            m[:3, 3] = x[6*n:6*n+3]
            m[:3, :3] = Rotation.from_rotvec(x[6*n+3:6*n+6]).as_matrix()
            result[ident] = m
        return result

    constraints = sorted(assembly["constraints"], key=lambda c: c["id"])

    def residual(x, gauges=False):
        p = poses(x)
        values = []
        for c in constraints:
            a, b = p[c["a"]] @ frame(c["frameA"]), p[c["b"]] @ frame(c["frameB"])
            values.extend(a[:3, 3] - b[:3, 3])
            relative = a[:3, :3].T @ b[:3, :3]
            if c["kind"] == "fixed":
                values.extend(Rotation.from_matrix(relative).as_rotvec())
            else:
                # Directed axis dot=+1 is required. Cross alone would allow mirrors.
                values.extend(relative[:, 2] - np.array([0., 0., 1.]))
                if gauges:
                    values.append(np.arctan2(relative[1, 0], relative[0, 0]) - c["referenceRad"])
        return np.asarray(values, dtype=np.float64)

    rng = np.random.default_rng(start_seed)
    x = np.zeros(6 * len(moving))
    if start_seed:
        x += rng.uniform(-0.25, 0.25, len(x))
    result = least_squares(lambda v: residual(v, True), x, ftol=1e-13, xtol=1e-13,
                           gtol=1e-13, max_nfev=2000, diff_step=1e-5)
    if not result.success or np.max(np.abs(residual(result.x, True)), initial=0) > 1e-8:
        raise Invalid("INCONSISTENT_OR_OVERCONSTRAINED")
    # Equivalent 2pi rotvec branches are coordinate singularities, not free DOF.
    for n in range(len(moving)):
        result.x[6*n+3:6*n+6] = Rotation.from_rotvec(result.x[6*n+3:6*n+6]).as_rotvec()
    # Rank of physical constraints excludes the sampled revolute reference gauge.
    step = 1e-6
    jac = np.column_stack([(residual(result.x + np.eye(len(x))[n]*step) -
                            residual(result.x - np.eye(len(x))[n]*step))/(2*step) for n in range(len(x))])
    rank = int(np.linalg.matrix_rank(jac, tol=1e-6))
    dof = len(x) - rank
    if dof != assembly["expectedDOF"]:
        raise Invalid("UNINTENDED_DOF")
    solved = poses(result.x)
    return {"id": assembly["id"], "expectedDOF": dof, "constraintRank": rank,
            "physicalDOFExcludesReferenceGauge": True,
            "poses": [{"instanceId": i, "cad": pose(solved[i]), "runtime": runtime_pose(solved[i])} for i in ids]}
