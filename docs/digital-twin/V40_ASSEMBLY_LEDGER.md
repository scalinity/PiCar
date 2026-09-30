# Z0104V40 — complete printed assembly ledger
This is the controlling transcription of the **29 printed steps** visible in owner photographs 04–06. Printed numbering remains unchanged. Source confidence below concerns what the printed instructions depict, not actual component dimensions or the owner's completed physical robot. The machine-readable planning seed contains the same records.

Every numeric interface frame and exact CAD final pose remains blocked until evidence resolves it; this is deliberate, not permission to select convenient XYZ coordinates. Connection intents below are binding semantic requirements. M2 turns them into canonical operation/endpoint IDs; M5–M7 supply admitted mechanical realizations. The common tools are a driver matched to the actual screw head, the supplied wrench where nuts are used, and hand placement. No tool size, torque, connector force or rivet-code dimension has been inferred.

All steps require the previous printed step in guided mode. Earlier setup guidance remains accessible; camera/connector power-off acknowledgments and per-servo zeroing conditions are suboperations, not extra printed steps. Pi4/Pi5 share most mounting instructions, but their camera ports/cables remain separate. Zero2W has its own support stack and a header-readiness prerequisite.

**Critical source checks completed in this pass:** four HAT screws in S04 for both diagram branches (including the partly occluded fourth screw); two M3x26 supports at S10; free rotation at S21; E right/F left at S25; Washer A at S19 and three Washer B per front wheel at S26; temporary P11 versus final P0/P1/P2. The source photos and legibility crops are included in EVIDENCE.

## 01. Prepare Plate A mounting supports

**ID:** `PX-V40-STEP-01` · **Source:** `PX-EV-PHOTO-04`, printed step 1 · **Parent:** base/electronics · **Prerequisite:** entry/preflight.

**Parts introduced / reused:** Plate A ×1. Pi4/Pi5: M2.5x18+6 nylon standoff ×4. Zero2W: M2.5x30 ×2 and M2.5x11 ×2.

**Hardware:** M2.5x6 screw ×4 for every branch.

**Connections and final constraints:** Plate-A rear-deck mounting holes -> screw bearing stack -> standoff base faces; all standoff axes normal to the mounting plane. Four physical support positions; branch chooses support types.

**Orientation / warning:** Keep the male ends of the Pi4/Pi5 M2.5x18+6 supports toward the Pi. For Zero2W distinguish the two tall HAT supports from the two short Pi supports; do not mirror the diagram.

**Tools:** Matched screwdriver; hand placement of nylon standoffs. Driver size/torque unresolved.

**Cable operations:** None. Power remains off.

**Servo zeroing:** None.

**Camera focus:** Rear deck, underside screw view then top support view.

**Motion recipe:** Stage A as workpiece; align each screw/support to its named hole axis; seat according to the evidenced stack. No dimensional animation before admission.

**Verification:** Correct four positions and branch-specific support types; zero duplicated hardware; support axes and bearing contacts pass when geometry exists.

**Geometry blockers:** Q-03, Q-06, Q-10. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 02. Mount the selected Raspberry Pi

**ID:** `PX-V40-STEP-02` · **Source:** `PX-EV-PHOTO-04`, printed step 2 · **Parent:** base/electronics · **Prerequisite:** PX-V40-STEP-01.

**Parts introduced / reused:** Selected Raspberry Pi ×1, user-supplied. Pi4/Pi5: M2.5x18 standoff ×4; USB mini microphone ×1 shown in the shared panel. Zero2W: M2.5x18+6 standoff ×2.

**Hardware:** No additional separate screw is prescribed in this panel; upper standoffs fasten the board.

**Connections and final constraints:** Pi mounting holes -> step-1 supports; upper standoff bearing faces clamp the selected board. Zero2W uses two short support positions, leaving tall HAT supports available.

**Orientation / warning:** GPIO header and camera connector must match the selected board orientation. Microphone insertion follows the matching board USB port; Zero2W USB adaptation is not prescribed here.

**Tools:** Hand fastening/matched tool if needed; no guessed torque.

**Cable operations:** Pi4/Pi5 USB mini microphone plug shown. Zero2W microphone remains an accounted accessory until an applicable adapter procedure exists.

**Servo zeroing:** None.

**Camera focus:** Rear-deck oblique with GPIO/camera connector labels.

**Motion recipe:** Board approaches along support axes, seats on bearing faces, then upper standoffs install. USB accessory is a separate child operation.

**Verification:** Board identity/branch; GPIO/header availability; correct support stack; no port collision; microphone disposition accounted.

**Geometry blockers:** Q-03, Q-06, Q-10, Q-14. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 03. Connect the Pi end of the camera ribbon

**ID:** `PX-V40-STEP-03` · **Source:** `PX-EV-PHOTO-04`, printed step 3 · **Parent:** base/electronics · **Prerequisite:** PX-V40-STEP-02.

**Parts introduced / reused:** One selected camera ribbon: Pi4 FFC; Pi5/Zero2W FPC. Alternative cable stock remains noninstalled.

**Hardware:** None.

**Connections and final constraints:** Selected cable Pi-end -> selected Pi camera connector; latch open/insertion/latch closed are separate presentation phases of one atomic connection operation. Camera end remains free.

**Orientation / warning:** Use the exact printed contact/stiffener orientation for that board connector; do not generalize a screen-space “blue side up”.

**Tools:** Hands; do not force latch.

**Cable operations:** Connect Pi end only, power OFF. Cable length/pitch and board-port identity need applicable source binding.

**Servo zeroing:** None.

**Camera focus:** Connector-normal macro view and source inset.

**Motion recipe:** Latch opens; approved ribbon end aligns/inserts; latch closes. Unknown flex shape uses schematic line.

**Verification:** Selected cable label; correct connector face; power-off acknowledgment; camera-end still disconnected.

**Geometry blockers:** Q-09, Q-10. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 04. Mount the Robot HAT

**ID:** `PX-V40-STEP-04` · **Source:** `PX-EV-PHOTO-04`, printed step 4 · **Parent:** base/electronics · **Prerequisite:** PX-V40-STEP-03.

**Parts introduced / reused:** Robot HAT ×1.

**Hardware:** M2.5x6 screw ×4 in all three branches; fourth screw confirmed by legibility crops.

**Connections and final constraints:** HAT GPIO connector -> Pi header; HAT holes -> four prepared support positions; screw bearing faces -> HAT/support stack.

**Orientation / warning:** No shifted GPIO engagement; preserve the camera-ribbon route under/around the board as illustrated. A ZERO-button-capable depiction does not identify actual HAT revision.

**Tools:** Matched screwdriver.

**Cable operations:** Camera ribbon already connected at Pi; keep clear of trapped edges. Power OFF.

**Servo zeroing:** None.

**Camera focus:** Top-oblique HAT/header alignment and side stack view.

**Motion recipe:** HAT approaches along GPIO/support axes; seat connector and mounting stack; four individually tracked screws install.

**Verification:** Four screw instances and supports; header keying/position; HAT revision applicability; no trapped ribbon or connector interference.

**Geometry blockers:** Q-03, Q-06, Q-07, Q-09, Q-10. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 05. Install the two drive motors

**ID:** `PX-V40-STEP-05` · **Source:** `PX-EV-PHOTO-04`, printed step 5 · **Parent:** drive/base · **Prerequisite:** PX-V40-STEP-04.

**Parts introduced / reused:** TT motor ×2; separate left/right role instances.

**Hardware:** M3x25 screw ×4; spring washer ×4; M3 nut ×4.

**Connections and final constraints:** Each motor mounting interface -> Plate A rear side-wall holes through the exact screw/washer/nut stack. Shaft interfaces remain available for rear wheels.

**Orientation / warning:** Motor wires face inward, as explicitly printed. Robot left/right, not viewer left/right, names the role.

**Tools:** Matched screwdriver and kit wrench; no assumed wrench size or torque.

**Cable operations:** Integrated motor leads are owned by their motor instances and remain unattached at the HAT.

**Servo zeroing:** None.

**Camera focus:** Underside rear drivetrain, then each mounting side.

**Motion recipe:** Motors align to mount axes; fasteners approach from illustrated access sides and seat in ordered stacks.

**Verification:** Correct inward lead exit; four complete fastener stacks; motor/shaft handed placement; unused HAT endpoints until S29.

**Geometry blockers:** Q-03, Q-04, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 06. Prepare battery hook-and-loop mounting

**ID:** `PX-V40-STEP-06` · **Source:** `PX-EV-PHOTO-05`, printed step 6 · **Parent:** drive/base · **Prerequisite:** PX-V40-STEP-05.

**Parts introduced / reused:** Battery ×1 staged; hook tape piece ×1 and loop tape piece ×1 allocated from supplied material.

**Hardware:** No mechanical fastener.

**Connections and final constraints:** Hook piece -> battery contact surface; loop piece -> underside of Plate A. Adhesive extents/thickness unresolved, not rigid dimensional constraints.

**Orientation / warning:** Hook on battery, loop on chassis underside as printed.

**Tools:** Hands; cutting tool only if material actually requires cutting, not an invented mandatory tool.

**Cable operations:** Battery integrated lead stays free. Power OFF.

**Servo zeroing:** None.

**Camera focus:** Underside mounting region and battery surface inset.

**Motion recipe:** Schematic peel/place if adhesive geometry unverified; pieces stay traceable to source material.

**Verification:** Correct mating material sides/locations; no invented dimensions; no double-counted whole roll and cut piece.

**Geometry blockers:** Q-03, Q-11. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 07. Secure and connect the battery

**ID:** `PX-V40-STEP-07` · **Source:** `PX-EV-PHOTO-05`, printed step 7 · **Parent:** drive/base · **Prerequisite:** PX-V40-STEP-06.

**Parts introduced / reused:** No new battery: use the same instance prepared in S06.

**Hardware:** No new fastener.

**Connections and final constraints:** Battery hook surface -> A loop surface; battery lead -> HAT BATTERY connector. Mount compliance and exact envelope require evidence.

**Orientation / warning:** Connector orientation must match its keyed interface; connected does not mean switch ON.

**Tools:** Hands.

**Cable operations:** Connect the existing battery lead to the printed BATTERY port. Maintain an explicit power-off acknowledgment requirement (not sensed power state) until zeroing.

**Servo zeroing:** None.

**Camera focus:** Underside pack, then HAT battery connector.

**Motion recipe:** Bring pack to its mounting surface; show lead endpoint connection without inventing an exact slack curve.

**Verification:** Same battery ID; correct BATTERY endpoint; mounting/lead clearance scope; switch state is user-acknowledged, not inferred.

**Geometry blockers:** Q-07, Q-09, Q-11. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 08. Attach the pan horn to the front chassis

**ID:** `PX-V40-STEP-08` · **Source:** `PX-EV-PHOTO-05`, printed step 8 · **Parent:** front/base · **Prerequisite:** PX-V40-STEP-07.

**Parts introduced / reused:** Pan-role servo arm/horn ×1.

**Hardware:** M1.5x3 screw ×4.

**Connections and final constraints:** Pan horn mounting holes -> Plate A front mounting holes; preserve spline/bore access for S19.

**Orientation / warning:** Horn sits at the front position shown to support the pan-tilt assembly; distinguish horn from the later servo body.

**Tools:** Matched screwdriver.

**Cable operations:** None.

**Servo zeroing:** No spline attachment yet; zeroing required later in S19.

**Camera focus:** Front chassis underside/horn mounting face.

**Motion recipe:** Horn aligns to the named chassis pattern; four screws seat individually.

**Verification:** Four prescribed screws; correct horn role and orientation; spline-access face remains available.

**Geometry blockers:** Q-03, Q-05, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 09. Install the ultrasonic module and Plate H

**ID:** `PX-V40-STEP-09` · **Source:** `PX-EV-PHOTO-05`, printed step 9 · **Parent:** front/base · **Prerequisite:** PX-V40-STEP-08.

**Parts introduced / reused:** Ultrasonic module ×1; Plate H ×1.

**Hardware:** R3080 rivet ×2.

**Connections and final constraints:** Ultrasonic mounting holes, Plate A front interface and H backing plate form the printed two-rivet stack; exact layer normals/grip require geometry.

**Orientation / warning:** Transducers face robot-forward. Retain H backing-plate position; do not swap a generic ultrasonic bracket.

**Tools:** Hands / printed rivet insert-push-lock procedure.

**Cable operations:** Sensor cable not connected until S28/S29.

**Servo zeroing:** None.

**Camera focus:** Front sensor mount, then backing-plate view.

**Motion recipe:** Module/backing align; rivet bodies insert and locking elements engage separately when mechanism admitted.

**Verification:** Correct R3080 code; two stacks; module/H alignment; connector clearance; no generic HC-SR04 identity substitution.

**Geometry blockers:** Q-03, Q-06, Q-08. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 10. Fit the two front support standoffs

**ID:** `PX-V40-STEP-10` · **Source:** `PX-EV-PHOTO-05`, printed step 10 · **Parent:** front/base · **Prerequisite:** PX-V40-STEP-09.

**Parts introduced / reused:** M3x26 standoff ×2.

**Hardware:** M3x6 screw ×2.

**Connections and final constraints:** A front underside mounting holes -> standoff top bearing faces; screws from the printed top access side. Lower faces remain for D in S23.

**Orientation / warning:** Supports extend under the front car. This is printed step 10, not step 11.

**Tools:** Matched screwdriver.

**Cable operations:** None.

**Servo zeroing:** None.

**Camera focus:** Front support axes, top screw view then underside.

**Motion recipe:** Align both standoff bores to A holes; insert screws; expose lower D attachment frames.

**Verification:** Two M3x26 definitions/instances; two M3x6 allocations; parallel/aligned support frames and intended stack.

**Geometry blockers:** Q-03, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 11. Connect the camera end of the ribbon

**ID:** `PX-V40-STEP-11` · **Source:** `PX-EV-PHOTO-05`, printed step 11 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-10.

**Parts introduced / reused:** Camera module ×1; reuse ribbon introduced at S03.

**Hardware:** None.

**Connections and final constraints:** Cable camera-end -> camera connector with open/insert/close latch operation. No second cable is introduced.

**Orientation / warning:** Follow the printed blue-plastic-side orientation at the camera itself; source inset remains available.

**Tools:** Hands; no force.

**Cable operations:** Connect other end of FFC/FPC while power OFF.

**Servo zeroing:** None.

**Camera focus:** Camera connector macro view.

**Motion recipe:** Show correct local-face approach and latch movement if admitted; otherwise source-panel sequence and schematic ribbon.

**Verification:** Single cable instance connects Pi and camera endpoints; contact orientation and power-off acknowledgment.

**Geometry blockers:** Q-08, Q-09. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 12. Mount the camera on Plate C

**ID:** `PX-V40-STEP-12` · **Source:** `PX-EV-PHOTO-05`, printed step 12 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-11.

**Parts introduced / reused:** Plate C ×1; reuse the camera from S11.

**Hardware:** R2048 rivet ×4.

**Connections and final constraints:** Camera PCB mount pattern -> C camera-mount face; four rivets activate their ordered camera/plate stacks.

**Orientation / warning:** Lens faces outward through the intended opening; ribbon remains connected and untrapped.

**Tools:** Hands / rivet procedure.

**Cable operations:** Preserve existing camera ribbon connection.

**Servo zeroing:** None.

**Camera focus:** Camera face and C rear/inside mounting holes.

**Motion recipe:** Camera and C align as a small subassembly; rivets install independently.

**Verification:** Four R2048 instances; camera/C holes and lens envelope; no cable pinching or duplicated camera instance.

**Geometry blockers:** Q-03, Q-06, Q-08, Q-09. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 13. Attach the tilt horn to Plate C

**ID:** `PX-V40-STEP-13` · **Source:** `PX-EV-PHOTO-05`, printed step 13 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-12.

**Parts introduced / reused:** Tilt-role servo horn ×1.

**Hardware:** M1.5x3 screw ×4.

**Connections and final constraints:** Tilt horn mounting pattern -> C side face; spline bore remains free for tilt output at S18.

**Orientation / warning:** Horn on the printed side of C; do not mirror it or assume it is the same arm shape as steering.

**Tools:** Matched screwdriver.

**Cable operations:** Keep camera ribbon clear.

**Servo zeroing:** Spline zeroing occurs at S18, not implied by horn-to-plate attachment.

**Camera focus:** C side/horn interface close-up.

**Motion recipe:** Horn approaches along its mounting normal; four screws seat.

**Verification:** Four correct screws; horn role/orientation; future tilt spline frame remains resolvable.

**Geometry blockers:** Q-03, Q-05, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 14. Install the pan servo on Plate B

**ID:** `PX-V40-STEP-14` · **Source:** `PX-EV-PHOTO-05`, printed step 14 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-13.

**Parts introduced / reused:** Plate B ×1; pan servo ×1.

**Hardware:** R2056 rivet ×2.

**Connections and final constraints:** Pan servo tabs -> B lower mounting surface; spline/output axis kept available for chassis horn.

**Orientation / warning:** Servo wire exits on the side shown in panel 14. Label the physical role Pan.

**Tools:** Hands / rivet procedure.

**Cable operations:** Pan integrated lead remains free for temporary P11 zeroing and later P0.

**Servo zeroing:** No horn mating until S19.

**Camera focus:** B lower servo tabs and wire-exit cue.

**Motion recipe:** Servo aligns to B; two R2056 bodies/pins install.

**Verification:** Correct pan role; two rivets; tab seating; cable-exit orientation; no assumed SG90 dimensions.

**Geometry blockers:** Q-03, Q-05, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 15. Install the tilt servo on Plate B

**ID:** `PX-V40-STEP-15` · **Source:** `PX-EV-PHOTO-05`, printed step 15 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-14.

**Parts introduced / reused:** Tilt servo ×1; reuse Plate B.

**Hardware:** R2056 rivet ×2.

**Connections and final constraints:** Tilt servo tabs -> B upright mounting face; output axis faces the C horn attachment.

**Orientation / warning:** Wire exit follows panel 15; preserve distinct pan and tilt role labels.

**Tools:** Hands / rivet procedure.

**Cable operations:** Tilt integrated lead remains free for P11 then P1.

**Servo zeroing:** No horn mating until S18.

**Camera focus:** B upright face, tilt output and lead exit.

**Motion recipe:** Servo aligns to upright B; two rivets install without moving the pan servo.

**Verification:** Two R2056 allocations; correct tilt output direction; clearance between servo housings.

**Geometry blockers:** Q-03, Q-05, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 16. Route the camera ribbon through the gimbal gap

**ID:** `PX-V40-STEP-16` · **Source:** `PX-EV-PHOTO-05`, printed step 16 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-15.

**Parts introduced / reused:** No new physical part.

**Hardware:** None.

**Connections and final constraints:** Existing camera ribbon route -> guide/gap between the B-mounted pan and tilt servos. Endpoint connections from S03/S11 remain unchanged.

**Orientation / warning:** The ribbon passes through the printed gap rather than outside the future articulation path.

**Tools:** Hands.

**Cable operations:** Route the existing FFC/FPC; no unsupported metric cable length, bend radius or strain claim.

**Servo zeroing:** None.

**Camera focus:** Gap between servo bodies with camera/connector context.

**Motion recipe:** Schematic route reveal until cable envelope is admitted; metric curve must obey actual guide/bend constraints.

**Verification:** Same cable/endpoints; correct guide topology; bend/slack check BLOCKED if its inputs are unknown.

**Geometry blockers:** Q-03, Q-05, Q-09. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 17. Introduce the servo-zeroing procedure

**ID:** `PX-V40-STEP-17` · **Source:** `PX-EV-PHOTO-05`, printed step 17 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-16.

**Parts introduced / reused:** No new part; prepared robot and servo leads.

**Hardware:** None.

**Connections and final constraints:** Procedure state: printed power ON -> ZERO button -> temporary single-servo P11 connection before each horn attachment. No permanent P0/P1/P2 wiring is created.

**Orientation / warning:** Use the exact depicted HAT interface when applicable; do not infer actual board revision from this drawing.

**Tools:** Hands; existing setup/software reference where applicable.

**Cable operations:** Temporary P11 is reserved for one servo at a time. Battery connection and procedure are explicit; this app does not energize hardware.

**Servo zeroing:** Acknowledge per-servo zeroing requirement; fresh role-specific confirmation at S18/S19/S22.

**Camera focus:** HAT power/ZERO/P11 inset plus source panel.

**Motion recipe:** Procedure interstitial, not a fabricated servo-angle measurement animation.

**Verification:** HAT/procedure applicability; temporary versus permanent ports; no blanket “all three zeroed” auto-certification.

**Geometry blockers:** Q-05, Q-07. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 18. Mate the camera/Plate-C assembly to tilt

**ID:** `PX-V40-STEP-18` · **Source:** `PX-EV-PHOTO-06`, printed step 18 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-17.

**Parts introduced / reused:** No new major part; C/camera/horn joins B/tilt.

**Hardware:** Smallest servo-package retaining screw ×1; exact dimensions/standard unresolved.

**Connections and final constraints:** Zeroed tilt output spline -> C tilt-horn spline; retaining screw seats through horn into output. Preserve C/camera as one internally connected subassembly.

**Orientation / warning:** Middle/zero orientation as printed; do not force an arbitrary horn index.

**Tools:** Matched screwdriver for the package screw.

**Cable operations:** Temporary tilt lead to P11 during zeroing; remove temporary assignment afterward; camera ribbon route remains.

**Servo zeroing:** Fresh tilt-instance zeroing attestation immediately before fixing horn.

**Camera focus:** Tilt spline/retainer macro view and camera orientation overview.

**Motion recipe:** Subassembly approaches spline axis, aligns indexed orientation, seats and receives retaining screw.

**Verification:** Correct smallest package screw, fresh tilt attestation, spline/frame alignment, cable clearance.

**Geometry blockers:** Q-03, Q-05, Q-06, Q-09. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 19. Mate the pan-tilt assembly to the chassis

**ID:** `PX-V40-STEP-19` · **Source:** `PX-EV-PHOTO-06`, printed step 19 · **Parent:** pan-tilt · **Prerequisite:** PX-V40-STEP-18.

**Parts introduced / reused:** Washer A ×1; reuse complete pan-tilt subassembly.

**Hardware:** Smallest servo-package retaining screw ×1.

**Connections and final constraints:** Zeroed pan output -> A-mounted pan horn, with the printed Washer A/retainer stack. Do not substitute Washer B.

**Orientation / warning:** Pan zero orientation and large-bore Washer A correspond to the printed callout.

**Tools:** Matched screwdriver.

**Cable operations:** Temporary pan lead P11 during zeroing, later free until P0 at S29; ribbon stays connected/routed.

**Servo zeroing:** Fresh pan-instance zeroing attestation immediately before fixing.

**Camera focus:** Pan base joint and Washer A close-up, then front overview.

**Motion recipe:** Move the whole gimbal to chassis horn, align spline and washer stack, install retaining screw.

**Verification:** Washer A identity; one pan retainer; fresh pan attestation; all subassembly members and camera cable preserved.

**Geometry blockers:** Q-03, Q-05, Q-06, Q-09. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 20. Install the steering servo

**ID:** `PX-V40-STEP-20` · **Source:** `PX-EV-PHOTO-06`, printed step 20 · **Parent:** steering/front · **Prerequisite:** PX-V40-STEP-19.

**Parts introduced / reused:** Steering servo ×1.

**Hardware:** R2056 rivet ×2.

**Connections and final constraints:** Steering servo tabs -> A steering mount; output remains available for G/horn assembly.

**Orientation / warning:** Wire exits on the printed side; label this instance Steering.

**Tools:** Hands / rivet procedure.

**Cable operations:** Integrated steering lead stays free for P11 then P2.

**Servo zeroing:** No horn attachment until S22.

**Camera focus:** Front upper/underside steering mount and wire exit.

**Motion recipe:** Servo approaches mounting face; two rivets insert/lock.

**Verification:** Remaining servo allocated once; correct role, orientation and two R2056 rivets.

**Geometry blockers:** Q-03, Q-05, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 21. Connect Plate G to the steering horn

**ID:** `PX-V40-STEP-21` · **Source:** `PX-EV-PHOTO-06`, printed step 21 · **Parent:** steering/front · **Prerequisite:** PX-V40-STEP-20.

**Parts introduced / reused:** Plate G ×1; steering-role horn ×1.

**Hardware:** M1.5x3 screw ×1.

**Connections and final constraints:** G center joint -> steering-horn offset hole using a revolute/free-rotation connection, not a rigid weld.

**Orientation / warning:** Do not overtighten: printed instruction explicitly requires free rotation between G and the horn.

**Tools:** Matched screwdriver; no invented torque target.

**Cable operations:** None.

**Servo zeroing:** Horn-to-spline zeroing occurs next in S22.

**Camera focus:** G/horn pivot close-up with rotation cue.

**Motion recipe:** Align hole axes, seat screw without depicting rigid locking; cue permitted joint motion only within evidenced limits.

**Verification:** One M1.5x3 screw; free joint retained; no rigid-constraint regression; actual play/torque not camera-certifiable.

**Geometry blockers:** Q-03, Q-05, Q-06, Q-12. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 22. Attach the steering horn assembly to its servo

**ID:** `PX-V40-STEP-22` · **Source:** `PX-EV-PHOTO-06`, printed step 22 · **Parent:** steering/front · **Prerequisite:** PX-V40-STEP-21.

**Parts introduced / reused:** Reuse G/horn subassembly and steering servo.

**Hardware:** Smallest servo-package retaining screw ×1.

**Connections and final constraints:** Zeroed steering spline -> steering horn spline; retaining screw secures horn while G retains its S21 relative revolute joint.

**Orientation / warning:** Nominal steering center as printed; distinguish spline fixation from the separate G pivot.

**Tools:** Matched screwdriver.

**Cable operations:** Temporary P11 during zeroing, then free until permanent P2 wiring.

**Servo zeroing:** Fresh steering-instance zeroing attestation immediately before fixing.

**Camera focus:** Steering spline/retainer and G link orientation.

**Motion recipe:** Subassembly aligns/seats on spline; screw installs without freezing G pivot.

**Verification:** Fresh steering attestation; third retaining screw allocated once; intended remaining DOF preserved.

**Geometry blockers:** Q-03, Q-05, Q-06, Q-12. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 23. Install Plate D on the front supports

**ID:** `PX-V40-STEP-23` · **Source:** `PX-EV-PHOTO-06`, printed step 23 · **Parent:** steering/front · **Prerequisite:** PX-V40-STEP-22.

**Parts introduced / reused:** Plate D ×1.

**Hardware:** M3x6 screw ×2.

**Connections and final constraints:** D mounting holes -> lower faces/bores of the two S10 M3x26 standoffs. Preserve front wheel-carrier mounting interfaces.

**Orientation / warning:** D lies beneath the front assembly in the illustrated orientation; sensor face and carrier holes remain accessible.

**Tools:** Matched screwdriver.

**Cable operations:** Keep existing leads/ribbon clear.

**Servo zeroing:** None.

**Camera focus:** Front underside support-to-D view.

**Motion recipe:** D approaches along support axes from below; two screws seat into standoffs.

**Verification:** Same two S10 supports; two remaining M3x6 screws; D orientation and clearance.

**Geometry blockers:** Q-03, Q-06. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 24. Attach the grayscale module to Plate D

**ID:** `PX-V40-STEP-24` · **Source:** `PX-EV-PHOTO-06`, printed step 24 · **Parent:** steering/front · **Prerequisite:** PX-V40-STEP-23.

**Parts introduced / reused:** Grayscale module ×1.

**Hardware:** R3055 rivet ×2.

**Connections and final constraints:** Grayscale board mounting holes -> D sensor-mount pattern; two rivet stacks.

**Orientation / warning:** Sensor and connector orientation must match panel 24 and expose the sensing face toward the intended ground-facing work area.

**Tools:** Hands / rivet procedure.

**Cable operations:** Sensor cable remains disconnected until S28/S29.

**Servo zeroing:** None.

**Camera focus:** D sensor-mount underside/connector view.

**Motion recipe:** Module aligns to D and two R3055 rivets install.

**Verification:** Correct module orientation, two rivets, sensor clearance and connector access; dimensions remain source-bound.

**Geometry blockers:** Q-03, Q-06, Q-08. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 25. Install right and left front wheel carriers

**ID:** `PX-V40-STEP-25` · **Source:** `PX-EV-PHOTO-06`, printed step 25 · **Parent:** steering/front · **Prerequisite:** PX-V40-STEP-24.

**Parts introduced / reused:** Plate E ×1 on robot right; Plate F ×1 on robot left.

**Hardware:** R3065 rivet ×6, three illustrated per side.

**Connections and final constraints:** Each carrier participates in upper/lower support pivots and steering-link attachment shown in the panel. Exact axis/stack incidence must be bound to named A/D/G/carrier interfaces before geometry admission.

**Orientation / warning:** E is robot-right and F robot-left; viewed from in front, E appears on the viewer left. Do not create mirrored copies without geometry evidence.

**Tools:** Hands / rivet procedure; avoid forcing the moving linkage.

**Cable operations:** No new cable.

**Servo zeroing:** Maintain nominal steering center from S22; no new zeroing claim.

**Camera focus:** Front view showing both carriers, then each pivot/link stack.

**Motion recipe:** Install each carrier along its prescribed access path, preserving linkage connections; no arbitrary fixed poses that conceal loop closure.

**Verification:** Six R3065 instances; correct E/F handedness; closed-chain consistency; allowed steering/pivot DOF and clearance.

**Geometry blockers:** Q-03, Q-06, Q-12. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 26. Install the front wheels

**ID:** `PX-V40-STEP-26` · **Source:** `PX-EV-PHOTO-06`, printed step 26 · **Parent:** steering/front · **Prerequisite:** PX-V40-STEP-25.

**Parts introduced / reused:** Front wheel ×2; Washer B ×6, three illustrated for each side.

**Hardware:** R30185 rivet ×2, one wheel axle per side.

**Connections and final constraints:** Each front wheel bore -> carrier axle interface, with three Washer B elements in the illustrated per-side stack and R30185 axle. Exact axial ordering/contacts are bound to source and CAD before admission.

**Orientation / warning:** Use small-bore Washer B, not A. Remove protective paper as the panel instructs; distinguish the removed backing from washer material.

**Tools:** Hands / rivet procedure.

**Cable operations:** None.

**Servo zeroing:** No new zeroing.

**Camera focus:** Wheel-axle stack macro view and both-front-wheel overview.

**Motion recipe:** Show individual washers and wheel insertion along axle; final free wheel rotation remains a declared joint.

**Verification:** Two front wheels, six B washers and two R30185 instances; correct washer type/order; wheel bearing/retention clearance.

**Geometry blockers:** Q-03, Q-06, Q-12. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 27. Fit the rear wheels to motor shafts

**ID:** `PX-V40-STEP-27` · **Source:** `PX-EV-PHOTO-06`, printed step 27 · **Parent:** chassis/rear-drive · **Prerequisite:** PX-V40-STEP-26.

**Parts introduced / reused:** Rear wheel ×2.

**Hardware:** No additional fastener shown.

**Connections and final constraints:** Rear-wheel bores -> left/right motor output shafts; seated according to evidenced shaft/hub geometry, not a front-wheel rivet joint.

**Orientation / warning:** Rear-wheel definition and hub orientation must match the motor-shaft arrangement. Do not reuse front-wheel geometry just because diameter looks similar.

**Tools:** Hands; no invented press force.

**Cable operations:** Preserve motor leads.

**Servo zeroing:** None.

**Camera focus:** Rear axle/shaft close-up and underside overview.

**Motion recipe:** Axial wheel approach and seating to the actual shaft interface; no guessed depth or fastener.

**Verification:** Two rear-wheel instances; shaft/bore compatibility and seating; no extra screw/rivet consumption.

**Geometry blockers:** Q-04, Q-12. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 28. Connect the sensor ends of their cables

**ID:** `PX-V40-STEP-28` · **Source:** `PX-EV-PHOTO-06`, printed step 28 · **Parent:** wiring/full-robot · **Prerequisite:** PX-V40-STEP-27.

**Parts introduced / reused:** 4-pin wire assembly ×1; 5-pin wire assembly ×1.

**Hardware:** None.

**Connections and final constraints:** 4-pin cable sensor-end -> ultrasonic connector; 5-pin cable sensor-end -> grayscale connector. HAT ends remain free until S29.

**Orientation / warning:** Keying/contact orientation from each exact connector; cable color is supplementary evidence, not definitive pin mapping.

**Tools:** Hands; connector work with power OFF.

**Cable operations:** Connect sensor ends only, retaining distinct cable and endpoint IDs.

**Servo zeroing:** None.

**Camera focus:** Ultrasonic and grayscale connector insets.

**Motion recipe:** Connector alignment/insertion where geometry admitted; schematic remainder of each cable.

**Verification:** Correct 4-pin versus 5-pin cable; one end connected per cable; power-off acknowledgment; electrical applicability conflicts visible.

**Geometry blockers:** Q-08, Q-09, Q-13. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.

## 29. Complete the Robot HAT wiring

**ID:** `PX-V40-STEP-29` · **Source:** `PX-EV-PHOTO-06`, printed step 29 · **Parent:** wiring/full-robot · **Prerequisite:** PX-V40-STEP-28.

**Parts introduced / reused:** No new required installed item; reuse all leads and cables. Unused accessories remain accounted for.

**Hardware:** None.

**Connections and final constraints:** Permanent HAT endpoints: pan P0/5V/GND; tilt P1/5V/GND; steering P2/5V/GND; ultrasonic D2,D3 with printed 3V3/GND; grayscale A0,A1,A2 with printed 3V3/GND; MOTOR1 left, MOTOR2 right.

**Orientation / warning:** Connector polarity/keying and exact conductor mapping are separate claims. The printed rail labels do not resolve the repository ultrasonic 5V applicability conflict by themselves.

**Tools:** Hands; power OFF for wiring. No automatic actuation or powered validation.

**Cable operations:** Remove any temporary P11 assignment; connect permanent endpoints; cable wrap/strain relief can be optional sourced guidance, not an invented printed step.

**Servo zeroing:** Preserve completed role-specific zeroing/attachment confirmations; no P11 in final wiring.

**Camera focus:** HAT connector map plus selectable per-cable endpoint views.

**Motion recipe:** Route/connect one labeled endpoint group at a time; exact cable curve only if admitted, otherwise clearly schematic.

**Verification:** All intended endpoints unique/resolved; no temporary P11; motor left/right correct; full inventory accounting; unresolved voltage/pin/strain claims BLOCKED rather than certified.

**Geometry blockers:** Q-07, Q-08, Q-09, Q-13. Reference instructions remain available; numerical motion/fit claims require G-GEOMETRY.
