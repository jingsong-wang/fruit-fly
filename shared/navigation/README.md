# Shared project navigation

Canonical standalone web component for six pages across four repositories. Author homepage and project switching remain in the same header location. Existing project explanation controls remain light DOM slots, preserving IDs and event handlers. Shadow DOM isolates menus from each site style; dark/light palettes preserve identity.

Run `python shared/navigation/sync.py` from the fruit-fly workspace to copy the canonical assets into every local project present. Each published repository serves its own copy, without cross-repository runtime dependencies. Missing sibling projects are skipped. Change the project catalog in lab-navigation.mjs, rerun sync, and deploy each affected repository.

Verified: 40 existing Node tests pass; desktop and 390px mobile menus; current-project highlighting; Escape dismissal; native explanation dialog open/close and focus restoration; game Space shortcut isolated from menu; original IDs preserved. Public deployment is performed through each existing Pages workflow.
