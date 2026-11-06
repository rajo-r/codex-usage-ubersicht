# Codex Usage Widget for Übersicht

A lightweight, read-only desktop widget showing **local OpenAI Codex token telemetry** on macOS. Inspired by an AI usage widget, but designed specifically for Codex session logs.

## Features

- Token usage today, over the last 7 calendar days, and over the last 30 days
- 30-day input/output breakdown and cached-input percentage
- Daily 30-day usage bar chart
- Number of local session files and token events; last activity timestamp
- Rounded card positioned at the **bottom-left** of the selected display
- No network access, API keys, or third-party Python dependencies

> **Important:** These numbers come from local Codex session logs, **not** OpenAI's subscription metering. Seven-day usage is a rolling calendar-day sum, **not** the official weekly quota/reset window. The widget does not show subscription credits, spending, or remaining limits.

## Requirements

- macOS and [Übersicht](https://tracesof.net/uebersicht/)
- Python 3 (system Python or another Python available on `PATH`)
- Codex sessions under `~/.codex/sessions/` (or a custom `CODEX_HOME`)

## Install

1. Download the repository ZIP or clone the repository.
2. Copy the **`codex-usage.widget` directory** into `~/Library/Application Support/Übersicht/widgets/`.
3. Restart Übersicht or refresh its widgets.
4. Use Übersicht's display settings to show the widget on the desired monitor.

To check the data collector directly:

```sh
python3 "$HOME/Library/Application Support/Übersicht/widgets/codex-usage.widget/fetch-usage.py"
```

It prints a JSON object. The `ok` property should be `true`. If no sessions exist, counts will be zero.

### Custom Codex directory

Set `CODEX_HOME` in the widget command in `index.jsx` (environment variables set only in your shell may not reach GUI applications):

```js
export const command = 'CODEX_HOME="$HOME/my-codex" /usr/bin/env python3 codex-usage.widget/fetch-usage.py';
```

### Position and size

Edit the `className` CSS in `codex-usage.widget/index.jsx`:

```css
position:absolute; bottom:20px; left:20px; width:390px;
```

## How it works

`fetch-usage.py` scans Codex JSONL session files and calculates deltas between cumulative `total_token_usage` counters within each file. It aggregates by the local date of each token event. The widget refreshes every 60 seconds.

## Limitations

- Session logs can be incomplete, rotated, or missing; totals may differ from service-side reporting.
- Events are attributed to their recording date, not necessarily the precise time of token consumption.
- Counters are interpreted as cumulative within a session; unexpected counter changes can affect totals.
- No project/model-level attribution or official subscription quota calculation.
- Depending on the Übersicht installation, the relative script path may need adjustment. Check the collector command first if the widget says “Waiting for local data”.

## Privacy

All processing is local. The collector reads `~/.codex/sessions/**/*.jsonl` and prints aggregated statistics. It does not upload data.

## License

MIT. See [LICENSE](LICENSE).
