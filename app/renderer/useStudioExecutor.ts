import { useState } from "react";
import { AppSettings, ClipboardItem } from "../types";
import { ProductionService } from "../services/productionCatalog";
import {
  DeveloperTool,
  DeveloperToolId,
  DEVELOPER_TOOLS,
  getDeveloperToolSample,
} from "../services/developerTools";
import { isWorkerSupportedTool, runDeveloperToolFast } from "../services/developerToolWorkers";
import { runServiceOperation, ServiceOperationResult } from "../services/serviceOperations";
import { PreviewRun } from "../components/studio/LivePreviewPanel";
import { copyToClipboard } from "../../shared/clipboard-utils";

const looksLikeError = (output: string) =>
  /^(error\b|invalid\b|.*error:|no input)/i.test((output.split("\n")[0] || "").trim());
const maybeJson = (output: string) => {
  try {
    return JSON.parse(output);
  } catch {
    return undefined;
  }
};

interface StudioExecutorProps {
  items: ClipboardItem[];
  settings: AppSettings;
  setStatus: (status: string) => void;
  setToolId: (id: DeveloperToolId) => void;
  setToolInput: (input: string) => void;
  toolOutputs: Record<string, string>;
  setToolOutputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  toolInput: string;
  currentTool: DeveloperTool;
  t: (key: string, fallback: string) => string;
}

export function useStudioExecutor({
  items,
  settings,
  setStatus,
  setToolId,
  setToolInput,
  toolOutputs,
  setToolOutputs,
  toolInput,
  currentTool,
  t,
}: StudioExecutorProps) {
  const [busy, setBusy] = useState(false);
  const [toolBusy, setToolBusy] = useState<DeveloperToolId | null>(null);
  const [currentRun, setCurrentRun] = useState<PreviewRun | null>(null);
  const [history, setHistory] = useState<PreviewRun[]>([]);

  const studioHistorySize = settings.studioHistorySize || 25;

  const pushRun = (run: PreviewRun) => {
    setHistory((prev) => [run, ...prev.filter((r) => r.id !== run.id)].slice(0, studioHistorySize));
  };

  const executeService = async (service: ProductionService, input: string) => {
    const startedAt = Date.now();
    setBusy(true);
    const running: PreviewRun = {
      id: `run-${startedAt}`,
      tool: service.displayName,
      state: "running",
      output: "",
      logs: [`Input loaded (${input.length} chars)`, `Service: ${service.id}`],
      startedAt,
    };
    setCurrentRun(running);
    setStatus(`Running service: ${service.displayName}...`);

    try {
      const result: ServiceOperationResult = await runServiceOperation(service, input, items);
      const durationMs = Date.now() - startedAt;
      const done: PreviewRun = {
        ...running,
        state: result.ok ? "success" : "warning",
        output: result.output,
        logs: [...running.logs, `Completed in ${durationMs}ms`, `Status: ${result.status}`],
        durationMs,
      };
      setCurrentRun(done);
      pushRun(done);
      setStatus(`${service.displayName} completed: ${result.status}`);
    } catch (error: any) {
      const durationMs = Date.now() - startedAt;
      const message = error?.message || `${service.displayName} failed`;
      const failed: PreviewRun = {
        ...running,
        state: "error",
        output: message,
        logs: [...running.logs, `Failed after ${durationMs}ms`],
        durationMs,
      };
      setCurrentRun(failed);
      pushRun(failed);
      setStatus(message);
    } finally {
      setBusy(false);
    }
  };

  const executeTool = async (id: DeveloperToolId, useSample = false) => {
    const tool = DEVELOPER_TOOLS.find((entry) => entry.id === id) || currentTool;
    const activeInput = id === tool.id ? toolInput : "";
    const input =
      (useSample ? tool.sample : activeInput.trim() ? activeInput : tool.sample) || tool.sample;
    const worker = isWorkerSupportedTool(id);
    const startedAt = Date.now();
    setToolBusy(id);
    setToolId(id);
    if (id !== tool.id) setToolInput(tool.sample);
    const running: PreviewRun = {
      id: `run-${startedAt}`,
      tool: tool.title,
      state: "running",
      output: "",
      logs: [
        `Input loaded (${input.length} chars)`,
        `Engine: ${worker ? "background worker" : "main thread"}`,
      ],
      startedAt,
    };
    setCurrentRun(running);
    setStatus(
      `${tool.title} ${t("studio.running", "running")}${worker ? " " + t("studio.inWorker", "in a background worker") : ""}...`
    );
    try {
      const output = await runDeveloperToolFast(id, input);
      const durationMs = Date.now() - startedAt;
      const done: PreviewRun = {
        ...running,
        state: looksLikeError(output) ? "warning" : "success",
        output,
        json: maybeJson(output),
        logs: [
          ...running.logs,
          `Completed in ${durationMs}ms`,
          looksLikeError(output) ? "Result flagged as error/warning by tool" : "Result OK",
        ],
        durationMs,
      };
      setCurrentRun(done);
      setToolOutputs((prev) => ({ ...prev, [id]: output }));
      pushRun(done);
      setStatus(`${tool.title} ${t("studio.completed", "completed")}`);
    } catch (error: any) {
      const durationMs = Date.now() - startedAt;
      const message = error?.message || `${tool.title} failed`;
      const failed: PreviewRun = {
        ...running,
        state: "error",
        output: message,
        logs: [...running.logs, `Failed after ${durationMs}ms`],
        durationMs,
      };
      setCurrentRun(failed);
      pushRun(failed);
      setStatus(message);
    } finally {
      setToolBusy(null);
    }
  };

  const copyTool = async (id: DeveloperToolId) => {
    const tool = DEVELOPER_TOOLS.find((entry) => entry.id === id) || currentTool;
    const output = toolOutputs[id] || (await runDeveloperToolFast(id, tool.sample));
    setToolOutputs((prev) => ({ ...prev, [id]: output }));
    await copyToClipboard(output);
    setStatus(`${tool.title} ${t("studio.outputCopied", "output copied")}`);
  };

  const loadToolSample = (id: DeveloperToolId) => {
    const tool = DEVELOPER_TOOLS.find((entry) => entry.id === id) || currentTool;
    setToolId(id);
    setToolInput(getDeveloperToolSample(id));
    setStatus(`${tool.title} ${t("studio.sampleLoaded", "sample loaded")}`);
  };

  return {
    busy,
    toolBusy,
    currentRun,
    history,
    setCurrentRun,
    setHistory,
    executeTool,
    executeService,
    copyTool,
    loadToolSample,
  };
}
