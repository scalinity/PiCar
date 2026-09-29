.. _hermes_picarx_skill:

23. Using Hermes Agent to Control PiCar-X
=============================================

.. note::

   This chapter is a PiCar-X Companion addition — it is not part of SunFounder's official
   documentation. Every Hermes command below comes from the official
   `Hermes Agent documentation <https://hermes-agent.nousresearch.com/docs/getting-started/installation>`_,
   and the PiCar-X skill and test tool are the same ones SunFounder ships for OpenClaw
   (see :ref:`picarx_skill`).

**What is Hermes Agent?**

Hermes Agent is an open-source AI agent from `Nous Research <https://nousresearch.com>`_.
Like OpenClaw, it goes beyond chat: it understands natural language instructions and can
actually run commands, manage files, and call tools on your Raspberry Pi. Two things set
it apart:

* **Self-learning skills:** Hermes automatically creates new skills from your conversations
  and refines them over time, building an agent that gets better at the tasks you actually
  give it.
* **Long-term memory:** It builds memory that persists across sessions — tell it once how
  you like your PiCar-X driven, and it remembers.
* **Many channels:** You can talk to it through the CLI on the Pi itself, or connect it to
  Telegram, Discord, email, and other messaging platforms via its gateway.

.. important::

   Hermes Agent requires a model with at least a **64,000-token context window** — smaller
   models are rejected at startup. Community Raspberry Pi guides recommend a **Pi 4 or Pi 5
   with 4 GB+ RAM**, pointed at a hosted LLM provider (the model runs in the cloud; the Pi
   only runs the agent loop). Like OpenClaw, the Pi Zero 2W (512 MB) is not enough.

Quick Start Hermes Agent
------------------------------

1. Open the terminal on your Raspberry Pi and run the official install script. It handles
   all dependencies (Python 3.11, Node.js 22, ripgrep, ffmpeg) automatically:

   .. code-block:: bash

      curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

   .. note::

      On a headless Pi you don't need browser automation — the installer supports a
      ``--skip-browser`` flag that skips the Playwright/Chromium download. See the official
      installation guide for details. Because new versions are updated rapidly, it's normal
      if your installation steps differ slightly.

2. Reload your shell so the ``hermes`` command is found:

   .. code-block:: bash

      source ~/.bashrc

3. Run the setup wizard:

   .. code-block:: bash

      hermes setup

   The wizard offers three modes:

   * **Quick Setup (Nous Portal)** — log in with OAuth, no API keys needed. The easiest path.
   * **Full Setup** — configure your own provider and tools manually.
   * **Blank Slate** — a minimal agent where every feature is an explicit opt-in.

   If you would rather use your own API key (for example an OpenRouter key), you can skip
   the portal and configure a provider directly:

   .. code-block:: bash

      hermes model

4. Verify the installation. ``hermes doctor`` checks dependencies and configuration and
   tells you exactly what is missing and how to fix it:

   .. code-block:: bash

      hermes doctor

5. Start chatting — plain CLI or the TUI interface:

   .. code-block:: bash

      hermes --tui

Making Hermes Agent Operate the PiCar-X
---------------------------------------------

**The same PiCar-X Skill, a different agent.**

The PiCar-X skill that SunFounder ships for OpenClaw is a portable skill bundle: a
``SKILL.md`` file (safety rules, code templates, and the mapping from natural language to
Python code) plus a ``scripts/pc.py`` command-line tool. Hermes Agent reads the same
``SKILL.md`` format, so the identical bundle teaches Hermes to drive your car:

* **Driving:** Drive forward, backward, turn left/right with steering servo control
* **Camera Gimbal:** Pan left/right, tilt up/down via the 2-axis camera gimbal
* **Sensors:** Read ultrasonic distance and grayscale data for line tracking and cliff detection
* **Sound:** Play sound effects and music through the car's speaker
* **Camera Vision:** Take photos, detect faces, track colors, recognize QR codes, gestures, and traffic signs

Prerequisites
------------------------------

Before you can use the PiCar-X skill with Hermes, make sure you have:

1. **PiCar-X** properly assembled and connected to your Raspberry Pi
2. **Hermes Agent** installed and set up (previous section)
3. The following Python libraries installed (see :ref:`install_all_modules`):

   * ``picarx``
   * ``robot_hat``
   * ``vilib``

You can verify the libraries by running:

.. code-block:: bash

   python3 -c "import picarx"

If this command runs without errors, you're ready to proceed.

Installing the PiCar-X Skill for Hermes
---------------------------------------------

Hermes keeps user skills in ``~/.hermes/skills/``. Installing the skill is one copy:

1. **Copy the PiCar-X skill bundle** into the Hermes skills directory:

   .. code-block:: bash

      cp -r ~/picar-x/picarx-control ~/.hermes/skills/

2. **Verify the files** are in place:

   .. code-block:: bash

      ls ~/.hermes/skills/picarx-control/

   You should see ``SKILL.md``, ``install.sh``, ``scripts/``, and ``references/`` in the output.

3. **Confirm Hermes discovered the skill:**

   .. code-block:: bash

      hermes skills list

   You can also validate installed skills with ``hermes skills check``.

.. note::

   Hermes exposes installed skills as slash commands automatically, and its skills hub
   (``hermes skills browse`` / ``hermes skills search``) offers many more community skills.

Testing the PiCar-X Skill from the CLI
---------------------------------------------

Before handing control to the agent, test the skill's command-line tool directly — the
commands are identical to the OpenClaw chapter, only the path differs.

**Check ultrasonic distance:**

.. code-block:: bash

   python3 ~/.hermes/skills/picarx-control/scripts/pc.py sensor distance

**Drive forward:**

.. code-block:: bash

   python3 ~/.hermes/skills/picarx-control/scripts/pc.py move forward --speed 60

**Turn left:**

.. code-block:: bash

   python3 ~/.hermes/skills/picarx-control/scripts/pc.py turn left --angle 30

**Set camera pan angle:**

.. code-block:: bash

   python3 ~/.hermes/skills/picarx-control/scripts/pc.py cam pan --angle 30

**Read grayscale sensor data:**

.. code-block:: bash

   python3 ~/.hermes/skills/picarx-control/scripts/pc.py sensor grayscale

**Run servo calibration:**

.. code-block:: bash

   python3 ~/.hermes/skills/picarx-control/scripts/pc.py calibrate

The full command set (``move``, ``turn``, ``cam``, ``sensor``, ``sound``, ``calibrate``)
is documented in the action tables of the :ref:`picarx_skill` chapter — the skill is the
same, so every table there applies here unchanged.

Using the PiCar-X Skill in Hermes Agent
---------------------------------------------

1. **Launch the Hermes TUI:**

   .. code-block:: bash

      hermes --tui

2. **Send natural language commands** to control PiCar-X. The same phrases from the
   OpenClaw chapter work here:

   * "Drive forward"
   * "Go backward"
   * "Turn left" / "Turn right"
   * "Check if there's something ahead"
   * "Look to the left" / "Look up" / "Look down"
   * "Take a photo"
   * "Detect faces"
   * "Find the color red"
   * "Follow the line"
   * "Check if there's a cliff ahead"

3. **Hermes will translate** your request into the appropriate ``pc.py`` invocation or
   Python code and execute it on the car. Thanks to its learning loop, sequences you ask
   for repeatedly (say, a patrol route) can become new skills of their own.

Troubleshooting
------------------------------

Hermes Agent Issues
^^^^^^^^^^^^^^^^^^^^^^^^

Q. ``hermes: command not found`` after installation.

   Reload your shell configuration, which adds ``~/.local/bin`` to your PATH:

   .. code-block:: bash

      source ~/.bashrc

Q. I get an "API key not set" error.

   Configure a provider with ``hermes model``, or set the key directly, for example:

   .. code-block:: bash

      hermes config set OPENROUTER_API_KEY your_key

Q. Something seems broken and I'm not sure what.

   The doctor diagnoses configuration and dependency issues, and can auto-repair many of
   them:

   .. code-block:: bash

      hermes doctor --fix

Q. My configuration seems missing after an update.

   Run ``hermes config check`` and then ``hermes config migrate``.

Q. I want Hermes to run 24/7 and answer from Telegram or Discord.

   Configure a messaging platform with ``hermes gateway setup``, then install the gateway
   as a service with ``hermes gateway install``. Check it with ``hermes gateway status``.
   On systems where systemd is unreliable (such as WSL), run it in the foreground with
   ``hermes gateway run`` instead.

PiCar-X Issues
^^^^^^^^^^^^^^^^^^^^^^^^

Q. PiCar-X doesn't respond to commands.

   First verify that PiCar-X is properly connected and powered on, then test basic
   functionality directly:

   .. code-block:: bash

      python3 ~/.hermes/skills/picarx-control/scripts/pc.py sensor distance

   If this fails, ensure the required Python libraries are installed:

   .. code-block:: bash

      python3 -c "import picarx; import robot_hat; import vilib"

Q. The ``import picarx`` test fails.

   The PiCar-X libraries are not installed — see :ref:`install_all_modules`, or run the
   skill's included install script:

   .. code-block:: bash

      bash ~/.hermes/skills/picarx-control/install.sh

Q. Hermes doesn't recognize the PiCar-X skill.

   Verify the skill with ``hermes skills check``, and if it still isn't picked up, restart
   the gateway:

   .. code-block:: bash

      hermes gateway restart

Q. PiCar-X movements seem jerky or the steering is off-center.

   This usually means servo calibration values are off. Run the calibration tool, or use a
   lower speed (for example ``--speed 40``) for smoother movement:

   .. code-block:: bash

      python3 ~/.hermes/skills/picarx-control/scripts/pc.py calibrate

.. tip::

   OpenClaw and Hermes Agent can coexist on the same Raspberry Pi — they install to
   different locations and each reads its own copy of the skill bundle. If you try both,
   just remember only one of them should drive the car at a time.
