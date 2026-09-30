# Future camera verification and AR boundary

## 1. Scope and stack decision

Camera support starts in M13, after the core application and its scoped geometry admissions are reliable. It is opt-in, local-first, and cannot turn an unverified model into a reference standard. The initial camera pipeline is **frontend capture via getUserMedia → local worker → AprilTag detector and OpenCV pose/projection operations compiled to bundled WASM → deterministic observation rules**. Use transferable image/RGBA buffers with a tested fallback; do not require WebCodecs. Rust handles permissions integration where necessary, observation persistence and artifact hashes, not a second image-analysis implementation. No camera code or permission prompt runs in M0–M12.

AprilTag and OpenCV supply well-defined geometric tools, not complete assembly recognition [W09/W10]. An optional learned component/keypoint detector is a candidate producer with confidence/visibility metadata. It cannot decide a hidden mechanical fact or override an applicable deterministic comparison. AI reasoning explains discrepancies, suggests a new view, or classifies a source issue; it never invents a geometric measurement or promotes source confidence.

## 2. Observation pipeline and required records

```text
capture frame and timestamp
 -> calibrated camera intrinsics + lens distortion + resolution/crop mapping
 -> fiducial detections and physical tag-size evidence
 -> tag-to-assembly registration and camera pose with uncertainty
 -> CAD projection of admitted target features
 -> visibility/occlusion and image-quality eligibility
 -> visible component/keypoint candidates
 -> deterministic rule comparison with propagated uncertainty
 -> PASS / RESCAN / HUMAN_CONFIRM, or explicit detected contradiction
 -> optional human interpretation; append scoped observation record
```

`CameraCalibration` records device/session identity, intrinsics matrix, distortion model/coefficients, capture resolution, calibration method, reprojection statistics, validity envelope and evidence. Changing camera resolution/crop or lens parameters invalidates its applicability unless a proven transform is supplied. `PoseObservation` records detector version, tag family/ID, corners, tag-size claim, pose solution alternatives, covariance or supported uncertainty bounds, quality flags and the tag-to-assembly registration hash.

`ObservationRecord` binds frame hash (when retained), calibration/pose/model/graph/feature hashes, rule ID, visible region, method/version, uncertainty, result and limitation. An observation is immutable; corrections supersede it. Physical step confirmations may cite several scoped observations but cannot mark unobserved properties as camera-verified.

A printed tag does not supply metric scale by itself. Its actual physical size and the rigid tag-to-assembly transform must be established. A tag placed arbitrarily on a table tracks the table, not the car. Use a known fixture or a registered attachment whose mechanical relationship is supported. Unknown tag scale or mounting pose returns RESCAN/HUMAN_CONFIRM, never an exact CAD overlay.

## 3. Observability model

Each VerificationRule includes an observability record:

| Class | Eligible examples | Preconditions / limits |
|---|---|---|
| `directVisible` | Present/absent visible component, exterior orientation, exposed washer at this moment | Sufficient pixels, known pose, visible distinguishing features, no contradictory occlusion |
| `conditionalVisible` | Connector insertion depth visible from a specified side; exposed cable contact orientation | Rule-specific view, calibration and image quality; hidden/internal latch engagement is not proven |
| `sequenceObserved` | A washer seen before a later plate obscures it | Historical observation supports a prior state only; later disassembly/change invalidates current inference |
| `activeTest` | Visible response to a human-initiated motion/check | Explicit safe procedure and observation bounds; app does not autonomously actuate in the core design |
| `measurementRequired` | Actual length, diameter or clearance needing suitable scale/metrology | Calibrated measurement method and uncertainty; an arbitrary photo does not qualify |
| `notCameraObservable` | Hidden screw length, torque, internal thread engagement, hidden washer now, material identity/strength | Must remain human/measurement/other-source scoped; camera result is NOT_APPLICABLE or BLOCKED |

A generic neural “assembled correctly” score is not a VerificationRule. A detector may identify a visible candidate, but a PASS requires the rule's explicit geometric and visibility conditions. Similar-looking fasteners cannot establish length hidden inside the assembly. No camera view proves torque. Historical visibility must not silently become continuous observation.

## 4. Deterministic comparisons and uncertainty

Use source-supported dimensions and calibration uncertainty. Compare projected feature locations, silhouette alignment or relative orientation against rule-specific tolerances. Set acceptance limits before evaluating held-out test frames; record them with the rule version. A rule's allowable residual must be meaningfully greater than combined model, pose and image-localization uncertainty. If uncertainty overwhelms the required distinction, return HUMAN_CONFIRM rather than widening the tolerance until the image passes.

Development fixtures establish controlled ground truth: synthetic camera projections, real calibrated test articles with independent measurements, deliberate wrong orientation/missing parts, low light, glare, motion blur, occlusion, tag damage, ambiguous planar pose and changing zoom. Report false PASS and false reject rates separately by rule and condition. Do not advertise target-camera precision from a synthetic-only test.

PASS means the named visible predicate is supported in the eligible frame/state. RESCAN means insufficient framing/quality/pose information and provides a specific view request. HUMAN_CONFIRM means the predicate cannot be resolved reliably or is outside camera observability. An observed contradiction is a separate FAIL finding shown with evidence; it must not be disguised as a low-confidence PASS. User acknowledgment of a warning is not deletion of the contradictory observation.

## 5. Camera-to-render transforms

The canonical robot basis remains the data-model basis. Keep a typed transform chain `CAD -> assembly registration -> tag/world -> camera` and calibrate it explicitly. OpenCV camera coordinates are +X right, +Y down, +Z forward [W09]. The Three camera convention has +X right, +Y up, view toward -Z. The camera-frame basis conversion is therefore `diag(1,-1,-1)` (determinant +1), distinct from the CAD-to-glTF object conversion. Test the two conversions independently to avoid applying either twice.

Use the calibrated intrinsic projection, not a guessed field of view matched by eye. Track crop/letterbox/display scaling separately from camera intrinsics. A user may manually reposition the overlay for inspection, but that mode is explicitly unregistered presentation and cannot produce metric observation checks.

## 6. AR implementation sequence

M14 first implements desktop camera passthrough with the admitted next component rendered through the calibrated projection. Reuse the canonical instance IDs, motion evaluator and stable final poses. A `PoseProvider` supplies timestamped rigid transform, projection/calibration identity, uncertainty and tracking validity; it does not modify the assembly graph.

On tracking loss, stale pose or ambiguous scale, hide metric overlay or freeze it with a clear invalid-tracking label and disable verification. Do not keep smoothly extrapolating as though alignment were known. Occlusion rendering is useful presentation but not proof of the underlying physical surface; unobserved occluders cannot be fabricated into evidence.

Mobile deployment is a later bounded platform gate, not a first-release WebXR assumption. The gate compares a phone browser and a native mobile adapter on an explicitly selected target device: camera permission, calibrated intrinsics access, local detector performance, pose stability, offline assets and privacy. Choose the first platform that passes those requirements with a reproducible build; otherwise retain desktop AR and report mobile unsupported. The shared PoseProvider and metre-based scene contract remain unchanged whichever platform wins. No desktop AR acceptance is described as a working phone app.

## 7. Privacy and retention

Default processing is local and frames are ephemeral. Store derived rule outcomes, calibration and pose metadata; retain raw frames only through an explicit user action. Show active capture clearly and release tracks when the feature closes. Do not capture the desktop, microphone or unrelated files. Do not enable telemetry containing images or pose data by default.

An optional cloud interpretation path must display the exact cropped/redacted input, provider and retention notice and require per-request approval. It is never a fallback silently activated when local inference fails. Cloud output cannot alter geometry confidence, hidden-property checks or canonical model data. Camera images and original owner photos remain outside default public CI/release artifacts. Export/import includes captures only when explicitly selected.
