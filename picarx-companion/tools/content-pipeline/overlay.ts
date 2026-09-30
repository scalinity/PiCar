// Hand-authored overlay: wizard structure and corrections for known data-quality
// issues in the upstream docs. Every reference here is validated by build.ts
// against the parsed content — a dangling page/section/video/pdf fails the build.
//
// The step order mirrors the official Quick Guide plus the explicit ordering
// rule in assemble.rst: install OS → install modules → zero servos → assemble.

import type { VideoEntry, WizardStep } from '../../src/lib/content-types';

export interface WizardStepDef extends Omit<WizardStep, 'pdf'> {
  /** filename under sunfounder-docs/pdfs/, rewritten to an app URL by the build */
  pdf?: string;
}

export const wizardSteps: WizardStepDef[] = [
  {
    id: 'parts',
    title: 'Check Your Kit',
    intro:
      'Verify the box contents against the printed parts list, and gather the items SunFounder does not include: the Raspberry Pi itself, a microSD card, and a power adapter.',
    content: [{ page: '_shared/pi_start/need_components' }],
    checklist: [
      { id: 'kit-verified', label: 'All kit parts present (checked against the printed list in the box)' },
      { id: 'pi-board', label: 'Raspberry Pi board ready (5 / 4 / 3 / Zero 2W)' },
      { id: 'sd-card', label: 'microSD card ready (32 GB recommended)' },
      { id: 'power-adapter', label: 'USB power adapter for the Pi (for setup before battery power)' },
    ],
  },
  {
    id: 'os',
    title: 'Install Raspberry Pi OS',
    intro:
      'Flash Raspberry Pi OS with the official Imager. Use the 64-bit version — the AI lessons need it — and preconfigure hostname, user, Wi-Fi, and SSH in the Imager so the Pi comes up reachable.',
    content: [{ page: '_shared/pi_start/install_os_trixie' }],
    checklist: [
      { id: 'imager', label: 'Raspberry Pi Imager installed on your computer' },
      { id: 'os-64bit', label: '64-bit Raspberry Pi OS written to the microSD' },
      { id: 'customized', label: 'Hostname, username/password, Wi-Fi and SSH set in OS customization' },
    ],
  },
  {
    id: 'power',
    title: 'Charge & Power',
    intro:
      'Charge the battery pack and learn the Robot HAT power behavior: the charge indicator, the power switch, and the boot beep.',
    content: [{ page: '_shared/pi_start/power_supply_robot_hat' }],
    checklist: [
      { id: 'charged', label: 'Battery pack charged (red LED behavior understood)' },
      { id: 'power-on', label: 'Power switch found; boot beep heard at least once' },
    ],
  },
  {
    id: 'connect',
    title: 'Connect to the Pi',
    intro:
      'Get a working session on the Pi — headless SSH is recommended since the Pi rides on the robot. Screen + keyboard works too.',
    content: [{ page: '_shared/pi_start/set_up_pi' }],
    checklist: [
      { id: 'address', label: "Pi's hostname or IP address known" },
      { id: 'ssh', label: 'SSH (or desktop) session to the Pi works' },
    ],
  },
  {
    id: 'software',
    title: 'Install the Software',
    intro:
      'Install the three SunFounder modules (robot-hat, vilib, picar-x) and enable the speaker. The calibration and example scripts used by later steps come from these installs.',
    content: [{ page: 'python/install_all_modules' }],
    checklist: [
      { id: 'apt', label: 'System updated (apt update && apt upgrade)' },
      { id: 'robot-hat', label: 'robot-hat installed (branch 2.5.x)' },
      { id: 'vilib', label: 'vilib installed' },
      { id: 'picar-x', label: 'picar-x installed (branch 2.1.x)' },
      { id: 'sound', label: 'i2samp.sh run (speaker enabled)' },
    ],
  },
  {
    id: 'servo-zero',
    title: 'Zero the Servos',
    intro:
      'Critical before assembly: every servo must be set to 0° before it is attached, or it can drive past its mechanical limit and damage itself. Keep this page handy during the whole assembly.',
    content: [{ page: 'adjust_servo' }, { page: 'python/py_servo_adjust' }],
    checklist: [
      { id: 'why', label: 'Understood why zeroing matters (servo range damage)' },
      { id: 'script', label: 'servo_zeroing.py runs (or V4.4+ HAT Zero button located)' },
      { id: 'p11-rule', label: 'Rule internalized: plug each servo into P11 + power on before fixing it' },
    ],
  },
  {
    id: 'assembly',
    assemblyLauncher: true,
    title: 'Assemble the PiCar-X',
    intro:
      'The printed booklet (shown here as the official PDF) is the authoritative assembly guide — the videos are backup for unclear steps. Zero each servo at P11 right before you screw it down.',
    content: [{ page: 'assemble' }],
    videos: ['assemble', 'video_a2_assembly'],
    pdf: 'picar-x-assembly.pdf',
    checklist: [
      { id: 'booklet', label: 'Assembled following the booklet page by page' },
      { id: 'servos-zeroed', label: 'Every servo zeroed immediately before being fixed' },
      { id: 'camera-off', label: 'Camera ribbon installed with the power OFF' },
      { id: 'wiring', label: 'All wiring connected (motors, servos, grayscale, ultrasonic, camera)' },
    ],
  },
  {
    id: 'calibrate',
    title: 'Calibrate',
    intro:
      'Fine-tune the steering, pan/tilt servos and motor direction, then calibrate the grayscale module for line tracking and cliff detection.',
    content: [{ page: 'python/python_calibrate' }],
    videos: ['video_a3_calibration'],
    checklist: [
      { id: 'servos', label: 'Steering / pan / tilt servos calibrated (1.cali_servo_motor.py)' },
      { id: 'motors', label: 'Both motors drive forward on E (reversed motors fixed with Q)' },
      { id: 'grayscale', label: 'Grayscale line + cliff calibration saved (1.cali_grayscale.py)' },
    ],
  },
];

// Pages authored by the Companion app itself (RST files in custom-docs/),
// parsed by the same whitelist parser and inserted into the nav next to the
// official content. navAfter = the sibling page id to insert after.
export const extraPages: { file: string; id: string; navParent: string; navAfter: string }[] = [
  {
    file: 'hermes.rst',
    id: 'custom/hermes',
    navParent: 'ai_interaction/ai_interaction',
    navAfter: 'openclaw',
  },
];

// Upstream image references whose case does not match the file on disk
// (breaks on case-sensitive filesystems; keyed by docs-source-relative path).
export const imagePathFixes: Record<string, string> = {
  'python/img/Z_P11.JPG': 'python/img/Z_P11.jpg',
};

// Known upstream data-quality issues, keyed by video slug (= source page basename).
export const videoCorrections: Record<string, Partial<VideoEntry>> = {
  // Page says "Video 12" (duplicate) and its related-tutorial ref points at
  // py_treasure; topically this video belongs to the Controlled-by-App lesson.
  video_12_using_mobile_app: {
    title: 'Video 13: Control PiCar-X with the Mobile App',
    lessonPage: 'python/control_by_app',
  },
  // The assembly page's own title is about the chapter, not the video.
  assemble: {
    title: 'PiCar-X Assembly Walkthrough',
  },
};
