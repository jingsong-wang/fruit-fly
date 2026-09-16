# Flylab Pong

Local browser demo using a reduced public Drosophila visual connectivity graph. Run `node server.mjs`, then open http://127.0.0.1:4173. No installation or GPU required. Run `node --test tests/core.test.mjs` for controller and deterministic physics checks.

## GitHub Pages

The `Test and deploy Flylab` workflow tests the controller, validates JavaScript, and publishes only `dist/`. Enable **Settings → Pages → Source → GitHub Actions** once. Pushes to `main` automatically update the site. The browser runs the simulation; the local Node server is not needed online. All application assets use relative URLs, supporting a repository subpath.

## Model and boundaries

Source: TuragaLab/flyvis, `flyvis/connectome/fib25-fib19_v2.2.json`, retrieved 2026-09-16; main commit observed: `92b3845cc426dd309a1a0e1b3890156c42e14021`. Original paper: https://doi.org/10.1038/s41586-024-07939-3.

65 named type entries, 605 connection rules. Sum spatial-offset synapse counts, apply alpha signs, normalize each target's absolute incoming weights. Discard geometry. Run two copies of a leaky tanh rate network. These are type populations, not 130 reconstructed individual neurons. Engineered vertical ball-minus-paddle error drives R1–R8; this is not a retinal simulation. A non-photoreceptor linear readout is trained with normalized SGD on synthetic error/desired-action pairs. This is interface calibration, not biological learning. No direct ball-position bypass is used by the neural readout.

Shuffled baseline permutes target labels over edges, retaining the weight list and target counts (not target strengths). It gets the same calibration procedure. Random action baseline samples every four fixed steps. Right paddle auto-returns the ball. Fair comparison runs 120 simulated seconds per mode, seed 42, difficulty 1, inputs enabled, separate from the live session. Single-seed demo results are not scientific evidence of a topology advantage.

The network view shows real model state in a schematic layout; traces show mean absolute activity in each channel. The model is NOT MaleCNS, NOT full-brain emulation, and NOT a reproduction of flyvis dynamics or published trained models.

Controls: Space to pause; select manual mode and use arrows/W/S or drag on the arena. Export records session settings/results in JSON. Simulation remains local. Optional Google Fonts can be blocked without affecting functionality.
