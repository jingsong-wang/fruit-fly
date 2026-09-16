# Digital fly: neuron-level feeding loop

Goal: add an online interactive arena with a neuron-level FlyWire 630 LIF model and a visibly embodied fly, preserving Pong at its current route.

Scope accepted in conversation: one measurable behavior first, with explicit separation of neural simulation, environmental mapping, and body controller. No claim of a complete biological twin. Shared cloud compute is optional pending measured browser performance; never provision paid infrastructure without a budget.

Architecture: public Shiu et al. connectivity converted to compressed outgoing CSR; a browser Web Worker advances a sparse-active LIF network. Main thread renders a kinematic six-legged body and environment. Sugar contact drives the author's 21 sugar GRNs; MN9 spikes control proboscis extension and food uptake. Exploration and joint trajectories are explicitly engineered controllers, not claimed connectome-derived locomotion. Browser simulation shows actual simulation/wall-time ratio. Preserve all source neuron and edge indices.

Tasks:
- [x] Convert pinned source data reproducibly, retain licenses, hashes, counts and exact source IDs.
- [x] Write core tests for LIF dynamics, inhibitory sign, delay, refractory behavior, sensory silencing and deterministic seed.
- [x] Implement worker and run zero-input versus sugar-input MN9 benchmark, comparing a dense reference integrator.
- [x] Build a polished arena with food placement, sugar stimulation, sensory cut and MN9 silencing, real traces and recording export.
- [x] Measure simulation speed; if insufficient, expose honest slowed simulation rather than pretend real-time.
- [ ] Run browser QA and existing tests, publish through current GitHub Pages workflow, verify public data and behavior.

Files: scripts/build-brain.py (download/conversion), dist/brain/{model.mjs,worker.mjs,world.mjs,view.mjs,app.mjs,index.html,style.css}, tests/brain.test.mjs, scripts/benchmark-brain.mjs, .github/workflows/pages.yml (build data at deployment).

Validation is model-level, not wet-lab reproduction. A full shared-server NeuroMechFly backend remains a distinct upgrade if browser-local models cannot meet the accepted behavioral/performance target.
