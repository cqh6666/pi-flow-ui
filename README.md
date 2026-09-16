# pi-flow-ui

Codex-inspired flow transcript, natural language summaries, and interactive tool inspector for the [Pi Coding Agent](https://github.com/earendil-works/pi-mono).

pi-flow-ui transforms Pi's tool execution into an elegant, distraction-free workflow. It combines Codex-like natural language action summaries, two-level clickable tool inspector, failure previews, syntax-highlighted diffs, and bilingual (English/Chinese) support into a cohesive experience.

## Install

```bash
pi install git:github.com/cqh6666/pi-flow-ui@main
```

Then reload Pi:

```text
/reload
```

For a temporary session with a local checkout:

```bash
pi -e /absolute/path/to/pi-flow-ui/index.ts
```

`/reload` reloads installed files. It does not fetch newer Git commits.

## Key Features

| Feature | Description |
|---|---|
| **Codex Natural Summaries** | Natural language action phrasing like `Read a file, ran commands` (or `读取了文件，执行了命令`) |
| **Interactive Inspector** | Click any group header to expand the group; click any individual tool row to inspect its output |
| **Bilingual i18n** | Full English and 简体中文 support across summaries, statuses, and the interactive configuration UI |
| **Interactive Settings** | `/flow-ui-config` TUI menu for real-time adjustments (headers, line limits, language) |
| **Configurable Actions** | Custom verb phrase mappings for any standard or user-defined tool via `toolActions` |
| **Failure Previews** | Automatically surfaces errors and failure root causes in the collapsed view |
| **Syntax Diffs** | Theme-colored diffs for file edits (`edit`) with clear addition/deletion markers |
| **Subagent Cards** | Specialized card rendering for `acp_delegate` sub-agents with hyperlinked output logs |
| **Stable Timing** | Freezes execution duration reliably; shows turn dividers with total elapsed time |

The renderer also removes empty native thinking placeholders and uses compact,
syntax-highlighted panels for fenced code blocks.

## Preview

### Codex Natural Mode (`headerStyle: "natural"`)

```text
▲ Read a file, ran 2 commands · 1.8s
│  ✓ bash: npm run check · exit 0 (1.2s)
│  ✓ edit: src/index.ts · +3/-1 (0.2s)
└  · thinking: Verifying module types… · ≈840 tok · 0.4s
```

In Chinese (`language: "zh"`):

```text
▲ 读取了文件，执行了 2 条命令 · 1.8s
│  ✓ bash: npm run check · exit 0 (1.2s)
│  ✓ edit: src/index.ts · +3/-1 (0.2s)
└  · thinking: 正在核对模块类型… · ≈840 tok · 0.4s
```

### Compact Mode (`headerStyle: "compact"`)

```text
✓ tools done · 3 tools · 1.2s
│  ✓ read · 2 files
└  · thinking: Checking call sites… · ≈1.2K tok · 1.4s
```

### Failure Priority Preview

A failure gets priority over ordinary successful output:

```text
✗ tools done · 3 tools · 1 failed · 2.8s
│  ✗ bash file.ts(8,2): error TS2322: Type mismatch · exit 2 (2.5s)
└  ✓ read · 2 files
```

### Two-Level Clickable Inspection

1. **Click the group title** (or press `Ctrl+O`): expands all tools in chronological order with result previews.
2. **Click any specific tool row**: toggle that individual tool's expanded/collapsed details independently.

```text
✓ tools done · 2 tools · 0.3s
├─ ✓ read src/auth.ts · 45 lines shown (0.1s)
│   export async function authenticate() { … }
└─ ✓ edit src/auth.ts · +2/-1 (0.2s)
    -12 const timeout = 1000;
    +12 const timeout = 5000;
    +13 const retries = 3;
```

## Configuration

Use `/flow-ui-config` (or `/compact-ui-config`) in Pi to open the interactive settings menu. You can switch header styles and adjust display thresholds with arrow keys and Enter.

Configuration is persisted at `~/.pi/agent/flow-ui.json` (also auto-migrates from `compact-ui.json`):

| Setting | Default | Purpose |
|---|---:|---|
| `language` | `"en"` | Language for summaries and headers: `"en"` (English) or `"zh"` (简体中文) |
| `headerStyle` | `"compact"` | Header style: `"compact"` (`tools done · N tools`) or `"natural"` (Codex-style: `Loaded a tool, read files, ran commands`) |
| `collapsedMaxLines` | `3` | Maximum lines shown when a tool group is collapsed |
| `expandedToolLines` | `5` | Result-preview lines per expanded tool |
| `expandedThinkingLines` | `10` | Thinking-preview lines when expanded |
| `standaloneTools` | `["compress"]` | Tools excluded from ordinary grouping (render with their own native UI) |
| `toolActions` | `{}` | Custom verb phrase mappings for the `"natural"` header style |

### Interactive Configuration (`/flow-ui-config`)

Run `/flow-ui-config` directly inside Pi:

- **Language / 语言**: Press `Enter` to switch between `English` and `简体中文`.
- **Header style**: Press `Enter` on Header style to open the picker, use `▲`/`▼` (or `j`/`k`) to switch between:
  - `compact`: e.g. `✓ tools done · 3 tools · 1.2s` (或 `✓ 工具调用完成 · 3 个工具 · 1.2s`)
  - `natural`: e.g. `✓ Read a file, ran commands · 1.2s` (或 `✓ 读取了文件，执行了命令 · 1.2s`)
- **Line limits**: Press `Enter` to open a slider stepper, adjust with `◀`/`▶` (or `−`/`+`), then press `Enter` to save.
- Settings are saved automatically to `~/.pi/agent/flow-ui.json` and take effect immediately.

### Default Configuration File

```json
{
  "language": "en",
  "collapsedMaxLines": 3,
  "expandedToolLines": 5,
  "expandedThinkingLines": 10,
  "standaloneTools": ["compress"],
  "headerStyle": "compact",
  "toolActions": {}
}
```

### Custom Tool Actions (`toolActions`)

When using `"headerStyle": "natural"`, you can define custom past and present tense phrases for any tool or custom extension (such as MCP tools or custom skills):

```json
{
  "headerStyle": "natural",
  "toolActions": {
    "todo": {
      "past": "updated tasks",
      "present": "updating tasks"
    },
    "send_file_to_wechat": {
      "past": "sent file to WeChat",
      "present": "sending file to WeChat"
    },
    "fetch_github": "synced repository"
  }
}
```

- **Two-form mapping**: `{ "past": "...", "present": "..." }` lets pi-compact-ui show active phrasing (e.g. `◐ Sending file to WeChat`) while running, and completed phrasing (e.g. `▲ Sent file to WeChat`) when done.
- **String shorthand**: `"fetch_github": "synced repository"` uses the same phrase for both states.
- **Fallback behavior**: Unmapped tools display `Running <tool>` / `Ran <tool>`, or fall back to standard grouping.

Edit `standaloneTools` in the JSON file and run `/reload` to apply the change.
Preserve other settings when updating this field.

### Preserve web_search's native UI

If you use `pi-web-access` and want its native progress bars, browser approval
links, shortcuts, and result rendering, add `web_search`:

```json
"standaloneTools": ["compress", "web_search"]
```

This is an optional personal setting, not the default. Search calls then render
independently and no longer merge into compact tool groups. Ordinary tools before
and after a standalone call form separate groups.

Grouped tools use compact-ui's summaries and result previews rather than their
original result UI. Reported phase labels do not reproduce every provider's
interactive progress display. Use standalone mode when those details matter.

### Context compression

With `compress` in `standaloneTools`, compression seals the preceding tool group
and displays its highlighted token-savings line and topic summaries independently.
These remain visible when other groups are collapsed. The extension styles an
existing `compress` tool; it does not provide context compression itself.

## Display rules

- Group duration spans the first observed tool start through the last end,
  including gaps between sequential calls. Parallel durations are not summed.
- Thinking duration measures observed thinking segments. Missing timestamps show
  `—s`; locally observed timing is not server-side model latency.
- Token counts are estimated during streaming and prefer provider-reported usage
  when available. Estimates are marked with `≈`.
- Result counts use final metadata or recognized native tool output. Unknown
  formats retain their argument summary. Successful Bash output alone does not
  establish an exit code; search prose is not treated as a result count.
- Read summaries count displayed lines, not the entire file. Grep excludes context
  rows and marks truncated counts or known lower bounds.
- Repeated file operations count distinct supplied paths; repeated searches count
  calls. Missing paths fall back to call counts. Errors, pending calls, and
  standalone tools stop aggregation. Expanded calls preserve their original order.
- Collapsed rows prioritize the first failure and most recent pending call.
  Thinking yields space when the line limit requires it.
- Expanded results and diffs remain bounded previews. An ellipsis indicates omitted
  lines; expanding a group does not guarantee the entire raw result is shown.

## File locations and full logs

Explicitly failed tool output can link leading diagnostic locations such as
`src/app.ts(42,7)` and `src/app.ts:42:7`. Relative paths resolve against the tool's
working directory. This supports common local POSIX paths; ambiguous text and
locations split across wrapped rows may remain plain text. If a shell command
changes directory internally, its relative diagnostics may need to be emitted as
absolute paths for correct links.

Links use `file://` URLs and Pi's OSC 8 terminal capability detection. They open
files using the terminal's configured handler; visible line and column numbers
are preserved, but exact editor line navigation is not guaranteed. Unsupported
terminals retain readable text. No editor command is executed by this extension.

Expanded Bash results show `Full output: <path>` when the tool supplies a valid
`details.fullOutputPath`. This entry remains outside the result-preview line
limit, although its displayed path is clipped to terminal width. The full URL
remains in the link. It does not reconstruct truncated output or create logs for
other tools. A log may have been deleted since execution; file existence is not
checked during rendering.

Subagent delegate tools (`acp_delegate`, `acp_delegate_wait`, `acp_delegate_cancel`,
`subagent`) display a distinct `⚡` badge, agent role brackets (e.g. `[reviewer]`,
`[worker]`), quoted task descriptions, and exit or dispatch status. When expanded,
supplied output file paths display as hyperlinked `Delegate output: <path>` entries.

Secondary transcripts can supply each tool's `cwd` for relative links. Without
it, only absolute paths are linked.

## Controls

| Action | Key |
|---|---|
| Expand or collapse all tool groups and thinking | `Ctrl+O` (Pi default) |
| Expand or collapse one group or subagent card | Left-click its title (fullscreen mode) |
| Expand or collapse one tool's output inside an expanded group | Left-click the tool's summary row |
| Move through settings | `Up` / `Down` |
| Adjust a numeric setting | `Left` / `Right`, `-` / `+` |
| Save a setting | `Enter` |
| Close settings | `Esc` |

Mouse expansion requires Pi's component mouse API (verified with Pi 0.85.1) and
`fullscreen` mode. Click the visible group title to toggle the group. The first
expansion shows every tool's preview; click an individual tool's summary row to
hide or show only its output. Closing and reopening the group by mouse preserves
these choices. Newly added tools show their previews when the group is expanded.
`Ctrl+O` resets individual choices and sets the global expanded state.
Output text, links, and padding retain their normal behavior. Modified clicks,
dragging, and the scroll wheel do not toggle groups or tools. Compression summaries
remain static. Secondary transcript hosts must forward mouse events to their components.

## Compatibility

The extension patches Pi presentation components and re-registers built-in tools
while delegating execution to Pi's native implementations. It does not modify
model-facing messages or tool results.

Avoid loading multiple compact-ui copies or competing built-in tool renderers
such as `pi-tool-display` and `pi-quiet-tools` together. Pi internal component
changes can also require compatibility updates; the wildcard peer dependencies
do not imply validation against every Pi release.

## Development

Use a checkout with the Pi peer dependencies available. Run the renderer tests:

```bash
node --test tests/*.test.mjs
```

Tests use fixed configuration during extension loading rather than reading your
personal display preferences. They exercise real tool components, timing events,
streaming results, narrow layouts, failures, diffs, and aggregation. The test loader
uses the `jiti` dependency resolved through the installed Pi package.

## Upstream credit

Credit for the original compact grouping implementation belongs to the upstream
`pi-compact-ui` project and its contributors. This repository was initialized
separately from the npm source and is not linked as a fork in GitHub's repository
metadata. The shared package name does not mean this fork publishes or maintains
the upstream npm release.
