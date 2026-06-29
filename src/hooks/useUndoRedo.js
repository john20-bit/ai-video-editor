import { useState, useCallback, useRef, useEffect } from "react";

export function useUndoRedo(initialState) {
  const [state, setState] = useState(initialState);
  const historyRef = useRef([initialState]);
  const indexRef = useRef(0);
  const isInternalUpdate = useRef(false);
  const batchTimerRef = useRef(null);
  const batchSnapshotRef = useRef(null);

  const commitSnapshot = useCallback(() => {
    if (batchSnapshotRef.current !== null) {
      const snapshot = batchSnapshotRef.current;
      batchSnapshotRef.current = null;
      if (snapshot === historyRef.current[indexRef.current]) return;
      historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
      historyRef.current.push(snapshot);
      indexRef.current = historyRef.current.length - 1;
      if (historyRef.current.length > 50) {
        historyRef.current.shift();
        indexRef.current--;
      }
    }
  }, []);

  const setStateWithHistory = useCallback((updater, options = {}) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (next === prev) return prev;
      if (isInternalUpdate.current) {
        isInternalUpdate.current = false;
        return next;
      }

      if (options.batch) {
        // Capture snapshot ONCE at start of batch
        if (batchSnapshotRef.current === null) {
          batchSnapshotRef.current = prev; // The PRE-drag state
        }
        // Clear any pending commit
        if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
        // Schedule commit after pause
        batchTimerRef.current = setTimeout(() => {
          commitSnapshot();
          // Also commit current state
          setState((current) => {
            if (current !== historyRef.current[indexRef.current]) {
              historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
              historyRef.current.push(current);
              indexRef.current = historyRef.current.length - 1;
              if (historyRef.current.length > 50) {
                historyRef.current.shift();
                indexRef.current--;
              }
            }
            return current;
          });
        }, 150);
        return next;
      }

      // Normal update: commit immediately
      historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
      historyRef.current.push(next);
      indexRef.current = historyRef.current.length - 1;
      if (historyRef.current.length > 50) {
        historyRef.current.shift();
        indexRef.current--;
      }
      return next;
    });
  }, [commitSnapshot]);

  const undo = useCallback(() => {
    if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
    batchSnapshotRef.current = null;
    if (indexRef.current > 0) {
      indexRef.current--;
      isInternalUpdate.current = true;
      setState(historyRef.current[indexRef.current]);
      return true;
    }
    return false;
  }, []);

  const redo = useCallback(() => {
    if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
    batchSnapshotRef.current = null;
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current++;
      isInternalUpdate.current = true;
      setState(historyRef.current[indexRef.current]);
      return true;
    }
    return false;
  }, []);

  const canUndo = indexRef.current > 0;
  const canRedo = indexRef.current < historyRef.current.length - 1;

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // Expose commitBatch as no-op for compatibility (the timer handles it now)
  const commitBatch = useCallback(() => {
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
      batchTimerRef.current = null;
    }
    commitSnapshot();
  }, [commitSnapshot]);

  return [state, setStateWithHistory, { undo, redo, canUndo, canRedo, commitBatch }];
}
