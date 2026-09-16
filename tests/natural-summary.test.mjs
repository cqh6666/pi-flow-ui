import assert from "node:assert/strict";
import test from "node:test";
import { loadExtension } from "./load-extension.mjs";

const { formatActionsSummary, isImagePath } = await loadExtension();

test("isImagePath accurately detects common raster and vector image formats", () => {
	assert.equal(isImagePath("test.png"), true);
	assert.equal(isImagePath("/path/to/cat.jpg"), true);
	assert.equal(isImagePath("IMAGE.JPEG"), true);
	assert.equal(isImagePath("vector.svg"), true);
	assert.equal(isImagePath("icon.ico"), true);
	assert.equal(isImagePath("index.ts"), false);
	assert.equal(isImagePath(undefined), false);
	assert.equal(isImagePath(123), false);
});

test("formatActionsSummary handles single and multiple viewed images", () => {
	assert.equal(
		formatActionsSummary([{ name: "read", args: { path: "preview.png" } }]),
		"Viewed an image"
	);
	assert.equal(
		formatActionsSummary([
			{ name: "read", args: { path: "first.png" } },
			{ name: "read", args: { path: "second.jpg" } }
		]),
		"Viewed 2 images"
	);
});

test("formatActionsSummary combines images with skills and commands like Codex", () => {
	assert.equal(
		formatActionsSummary([
			{ name: "read", args: { path: "preview.png" } },
			{ name: "bash", args: { command: "ls" } }
		]),
		"Viewed an image, ran a command"
	);

	assert.equal(
		formatActionsSummary([
			{ name: "read", args: { path: "/Users/test/.pi/agent/skills/simplify/SKILL.md" } },
			{ name: "read", args: { path: "chart.png" } },
			{ name: "bash", args: { command: "npm test" } }
		]),
		"Read simplify skill, viewed an image, ran a command"
	);
});

test("formatActionsSummary handles standard tool combinations (loaded tool, read files, ran commands)", () => {
	assert.equal(
		formatActionsSummary([
			{ name: "tool_search" },
			{ name: "read", args: { path: "a.ts" } },
			{ name: "read", args: { path: "b.ts" } },
			{ name: "bash", args: { command: "cmd1" } },
			{ name: "bash", args: { command: "cmd2" } }
		]),
		"Loaded a tool, read files, ran commands"
	);
});

test("formatActionsSummary supports present tense (isPending=true) during tool execution", () => {
	assert.equal(
		formatActionsSummary([{ name: "bash", args: { command: "ls" } }], true),
		"Running a command"
	);
	assert.equal(
		formatActionsSummary([
			{ name: "bash", args: { command: "ls" } },
			{ name: "bash", args: { command: "pwd" } }
		], true),
		"Running commands"
	);
	assert.equal(
		formatActionsSummary([
			{ name: "read", args: { path: "a.ts" } },
			{ name: "read", args: { path: "b.ts" } }
		], true),
		"Reading files"
	);
	assert.equal(
		formatActionsSummary([
			{ name: "read", args: { path: "/Users/test/.pi/agent/skills/simplify/SKILL.md" } }
		], true),
		"Reading simplify skill"
	);
	assert.equal(
		formatActionsSummary([
			{ name: "read", args: { path: "a.ts" } },
			{ name: "bash", args: { command: "ls" } }
		], true),
		"Reading a file, running a command"
	);
});

test("formatActionsSummary accurately formats search, directory, task, context and custom tools", () => {
	assert.equal(
		formatActionsSummary([{ name: "grep", args: { pattern: "test" } }]),
		"Searched code"
	);
	assert.equal(
		formatActionsSummary([{ name: "find", args: { pattern: "*.ts" } }], true),
		"Searching code"
	);
	assert.equal(
		formatActionsSummary([{ name: "ls", args: { path: "." } }]),
		"Browsed directory"
	);
	assert.equal(
		formatActionsSummary([{ name: "compress", args: {} }]),
		"Managed context"
	);
	assert.equal(
		formatActionsSummary([{ name: "task_start", args: { command: "echo 1" } }]),
		"Ran a task"
	);
	assert.equal(
		formatActionsSummary([{ name: "todo", args: {} }]),
		"Ran todo"
	);
	assert.equal(
		formatActionsSummary([{ name: "todo", args: {} }], true),
		"Running todo"
	);
	assert.equal(
		formatActionsSummary([
			{ name: "grep", args: {} },
			{ name: "read", args: { path: "a.ts" } },
			{ name: "edit", args: { path: "a.ts" } },
			{ name: "bash", args: { command: "npm test" } }
		]),
		"Read a file, edited a file, ran a command (+1 more)"
	);
});

test("formatActionsSummary respects custom configured tool actions", () => {
	const customActions = {
		todo: { past: "updated task list", present: "updating task list" },
		send_file_to_wechat: { past: "sent file to WeChat", present: "sending file to WeChat" },
		fetch_github: "synced repo"
	};

	assert.equal(
		formatActionsSummary([{ name: "todo", args: {} }], false, customActions),
		"Updated task list"
	);
	assert.equal(
		formatActionsSummary([{ name: "todo", args: {} }], true, customActions),
		"Updating task list"
	);
	assert.equal(
		formatActionsSummary([{ name: "send_file_to_wechat", args: {} }], false, customActions),
		"Sent file to WeChat"
	);
	assert.equal(
		formatActionsSummary([{ name: "send_file_to_wechat", args: {} }], true, customActions),
		"Sending file to WeChat"
	);
	assert.equal(
		formatActionsSummary([{ name: "fetch_github", args: {} }], false, customActions),
		"Synced repo"
	);
});

test("formatActionsSummary supports Chinese language mode", () => {
	assert.equal(
		formatActionsSummary([{ name: "bash", args: { command: "npm test" } }], false, {}, "zh"),
		"执行了命令"
	);
	assert.equal(
		formatActionsSummary([{ name: "bash", args: { command: "npm test" } }], true, {}, "zh"),
		"正在执行命令"
	);
	assert.equal(
		formatActionsSummary([
			{ name: "read", args: { path: "a.ts" } },
			{ name: "edit", args: { path: "a.ts" } },
			{ name: "bash", args: { command: "npm test" } }
		], false, {}, "zh"),
		"读取了文件，编辑了文件，执行了命令"
	);
	assert.equal(
		formatActionsSummary([
			{ name: "grep", args: {} },
			{ name: "read", args: { path: "a.ts" } },
			{ name: "edit", args: { path: "a.ts" } },
			{ name: "bash", args: { command: "npm test" } }
		], false, {}, "zh"),
		"读取了文件，编辑了文件，执行了命令 (等共 4 项)"
	);
});


