# Game analytics decision guide

Billy Bob Games records a small, privacy-conscious event funnel through GA4 and MyWebAstra. MyWebAstra stores the event name and page path, so its report can be filtered by a specific game URL. GA4 also receives the non-personal event parameters listed below.

## Core funnel

| Event | Meaning | Product question |
| --- | --- | --- |
| `game_click` | A visitor selected a game link | Which cards, categories, and placements attract interest? |
| `game_loaded` | The embedded game loaded successfully | Does the game reach a playable state? |
| `game_start` | The player made the first pointer, touch, keyboard, or wheel interaction inside the game | Do visitors actually try the game after it loads? |
| `game_engaged_15s` | Active play reached 15 seconds | Does the first experience hold attention? |
| `game_engaged_60s` | Active play reached 60 seconds | Is the basic game loop engaging? |
| `game_engaged_180s` | Active play reached 180 seconds | Which games deserve deeper investment and related content? |
| `game_end` | An interacted session ended or the page was hidden | What are active time and interaction depth? |

`game_start` is deliberately not emitted merely because an iframe loaded. This keeps the start rate tied to a real player action.

## Quality and interface events

- `game_load_slow`: the frame was still loading after 12 seconds.
- `game_load_retry`: the player pressed the retry button.
- `game_load_error`: the browser reported an iframe loading error.
- `game_wide_mode_enter` / `game_wide_mode_exit`: use of the in-page wide view.
- `game_fullscreen_enter` / `game_fullscreen_exit`: use of browser fullscreen.
- `game_exit_under_15s`, `game_exit_15_to_59s`, `game_exit_60_to_179s`, `game_exit_180s_plus`: one duration bucket per interacted session.

## Supported in-game events

C4 currently emits the standard game bridge events below. Future games can use the same parent-message contract without sending names, chat, free text, save files, or other personal data.

- `game_round_start`, with a coarse mode such as `offline_ai`.
- `game_mode_offline_ai`, `game_mode_offline_human`, or `game_mode_ai_vs_ai`, so mode preference is visible in MyWebAstra without storing event properties.
- `game_first_move`.
- `game_round_complete`, with `win` or `draw` only.
- `game_round_restart`.
- `game_round_abandon`.
- `game_error`, with a fixed technical reason.

## Weekly review

Filter MyWebAstra to one game path and compare a complete seven-day period:

1. `game_loaded / pageviews`: low values point to loading or browser compatibility problems.
2. `game_start / game_loaded`: low values point to unclear controls, a weak first screen, or misleading traffic.
3. `game_engaged_60s / game_start`: use this as the main early-retention signal.
4. `game_engaged_180s / game_start`: use this to decide which games deserve more internal links, guides, and similar additions.
5. `game_load_slow + game_load_retry + game_load_error`: fix reliability before adding more content around that game.
6. Compare mobile and desktop in MyWebAstra before changing controls or layout.

Avoid making directional decisions from a handful of starts. Record the observation, wait for a full comparison window, and change one major variable at a time.
