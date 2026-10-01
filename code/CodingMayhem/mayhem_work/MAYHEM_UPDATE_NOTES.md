# Python Micro Mayhem - Updated Build

This build keeps the existing visual direction and adds a more structured learning loop.

## Fixed / changed

- Versus result screens now show Player 1 and Player 2 results separately.
- Each player must acknowledge the versus result before the next round starts.
- Wrong answers can display the player's own correct answer and explanation.
- Correct answers can also show the answer/explanation so the game teaches instead of only scoring.
- LANE LOGIC now gives Player 1 and Player 2 separate generated lane challenges.
- QUICK CODE and BUBBLE BLITZ use a shared screen in versus mode.
- QUICK CODE and BUBBLE BLITZ can accept both controllers on the same challenge.
- The original underlying microgame remains visible behind the result panel rather than being replaced by a full-screen failure card.

## Added learning-focused microgames

### BOOLEAN BLITZ
Practice boolean expressions, comparisons, `and`, `not`, and truth values.

### LOOP LAB
Trace loops and predict final values. The challenge uses randomized values so students cannot simply memorize an answer.

### FUNCTION FORGE
Trace a function call from input to return value. This reinforces parameters, return values, and function execution.

### COMPLEXITY CRASH
Identify basic time-complexity patterns such as O(1), O(n), O(log n), and O(n²). This is weighted toward Hard/Extreme.

The project now has a broader mix of mechanics rather than relying mostly on button-press variants.

## Recommended future learning additions

1. **Explain-after-answer rule**
   Keep explanations short during play, but always show the reasoning after a round. This turns mistakes into teaching moments.

2. **Concept rotation**
   Avoid running the same concept repeatedly. Rotate variables, operators, conditions, loops, functions, lists, strings, debugging, recursion, and algorithms.

3. **Difficulty should change reasoning, not only speed**
   Easy should simplify the concept. Hard/Extreme should add multiple steps, misleading distractors, edge cases, and code tracing rather than only reducing the timer.

4. **Distractor quality matters**
   Wrong answers should represent common student mistakes. For example, a loop question can include an off-by-one answer instead of four random numbers.

5. **Occasional confidence checks**
   Add a few challenges where students choose between two very similar outputs. These expose misunderstandings that ordinary trivia questions may miss.

6. **Boss / interview rounds**
   Every several rounds, use a slower challenge where the student explains or constructs a solution. This can test whether they understand the concept instead of recognizing a pattern.

7. **Progress by concept**
   Eventually track categories such as `variables`, `conditions`, `loops`, `functions`, `debugging`, and `algorithms`. The game can use that information to serve more practice in concepts the student misses.

8. **Do not make every game a multiple-choice quiz**
   Keep a mix of debugging, sequencing, tracing, navigation, matching, construction, and prediction. The programming idea should influence the gameplay mechanic.

## Suggested eventual 12-mechanic roster

- Quick Code
- Bubble Blitz
- Lane Logic
- Bug Hunt
- Code Crash
- Match Attack
- Trace Race
- Code Maze
- Boolean Blitz
- Loop Lab
- Function Forge
- Complexity Crash

These mechanics can generate many more than 40 individual challenge instances because their data can be randomized.

## Difficulty scaling + UX pass
- Bubble Blitz now scales its target count: Easy 4, Medium 8, Hard 16, Extreme 16 with substantially harder code and more meaningful distractors.
- Match Attack scales its pair count: Easy 3, Medium 5, Hard 7, Extreme 8.
- Lane Logic now grows from a simple if/else to elif chains, compound boolean conditions, and an Extreme branch tree.
- Code Order now scales from 4 to 10 scrambled lines and explicitly presents itself as a code-ordering challenge.
- Bug Hunt now supports multiple bugs at Extreme and requires finding every bug before the round resolves.
- Trace Race now includes next-state / predict-the-next-step style challenges at higher difficulties.
- Quick Code, Boolean Blitz, Loop Lab, Function Forge, and Complexity Crash now use difficulty-specific code instead of repeating the same challenge bank across levels.
- Distractors were revised toward common programming mistakes such as off-by-one errors, stale values, skipped updates, incorrect branch assumptions, and nested-call mistakes.
- Every result now carries a short Why explanation; solo correct results also show the explanation and stay visible longer.
- Fixed Match Attack so selecting a left item no longer falsely highlights the first right-side match. A right-side item only becomes highlighted after the player actually selects/aims at it.
- Mode Select cards now stretch to equal height.
- Screen transitions no longer use a scale/translate transform, removing the small wobble/jitter when moving between screens.

## Final gameplay/UX pass

- Added LOOP COUNT: players press X once per loop execution; the running count is hidden until the timer ends.
- Added ALGORITHM ARENA: a large two-robot maze where each player solves movement code, presses X once per space, then Circle to lock. Correct movement advances the robot along a valid route toward the center. The first robot to reach the center ends the race.
- Algorithm Arena uses separate per-player question timers in versus mode so one player can progress without interrupting the other.
- Bubble Blitz now places bubbles at randomized positions/sizes inside a bounded play square with collision-aware placement to prevent overlap or clipping.
- Match Attack selection was tightened so choosing a left item no longer visually arms/highlights a right item until the right item is explicitly selected.
- Hard/Extreme general microgame timers were increased so difficulty comes primarily from reasoning/code complexity rather than unreadable speed.
- Mode cards now use a consistent minimum height/grid row sizing.
- Button press depth was reduced to remove the noticeable screen wobble when navigating between screens.
- Difficulty screen copy now describes deeper reasoning rather than simply less time.
- No AI/API dependency was added; question generation remains deterministic/randomized locally so answers and explanations stay controlled.


## Final UX/Difficulty Cleanup

- Removed Code Maze / Algorithm Arena from the active microgame pool.
- Easy / Medium / Hard / Extreme round timers are now 30 / 25 / 20 / 20 seconds. Difficulty is driven by programming complexity rather than an artificially tiny timer.
- LOOP LAB and FUNCTION FORGE each cycle through exactly four curated question variants per difficulty.
- MATCH ATTACK mouse/touch selection was fixed: selecting a left item immediately arms the right-side choices.
- BUBBLE BLITZ now uses a packed 2x2 / 4x2 / 4x4 layout with randomized sizes and jitter, keeping every bubble inside the square arena without overlap.
- BUBBLE BLITZ answer position is rotated by round serial so the correct target is not repeatedly presented in the same logical slot.


## Final polish build
- Algorithm Arena is now a Hard/Extreme-only versus race on a large generated maze with walls and a crown in the center. Each player gets four movement programs, selects one with the controller, the robot executes the movement, and a fresh program set appears. The first player to the crown wins; the 90-second race timeout gives a loop/movement lesson.
- Easy/Medium never generate Algorithm Arena.
- Easy/Medium/Hard/Extreme question timers remain 30/25/20/20 seconds.
- Bubble Blitz uses larger square-safe layouts: 4 / 8 / 16 targets with no intentional overlap.
- Match Attack selection was simplified so mouse/controller selection reliably activates the matching side.
- Loop Lab and Function Forge retain four question variants per difficulty with shuffled answer positions.
