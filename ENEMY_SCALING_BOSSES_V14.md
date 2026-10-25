# Enemy Scaling & Multi-Boss Update (v14)

- Initial hostile count scales with selected level and is hard-capped at 30 active hostiles, including bosses.
- Reinforcement pressure accelerates with level while active hostiles remain capped at 30.
- Enemy health already scales by level; firing cadence, accuracy, and flanking radius now increase more meaningfully as levels rise.
- Campaign/Rescue/Sabotage-style missions use up to three commanders: one at early levels, two from level 5, and three from level 10 onward.
- Survival elite waves can spawn multiple commanders as wave and level rise, while respecting the 30-hostile ceiling.
- A non-Survival mission only completes after all active commanders are defeated.
- Existing payment, wallet, auth, save, protected backend and app-ID files were not changed.

Validation: catalog test, asset validation, service-worker syntax and ZIP integrity checked. Full Vite/TypeScript build and live gameplay stress testing remain unverified because project dependencies are not installed in this environment.
