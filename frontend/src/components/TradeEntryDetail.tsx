import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteTradeEntry,
  getTradeEntry,
  updateTradeEntry,
} from "../api/api.js";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import TextEditor from "./TextEditor.js";
import ImageUpload from "./ImageUpload";
import { TradeEntry } from "../types/tradeEntry.types.js";
import { getAccounts } from "../api/api.js";
import { formatCurrency, pnlColor, toDatetimeLocal, formatDateTime } from "../utils/formatUtils";
import {
  formInputStyles,
  formLabelStyles as panelLabelStyles,
  detailClickValueStyles as clickValueStyles,
} from "../utils/styleConstants";
import Select from "./Select";
import LoadingSpinner from "./LoadingSpinner";
import ErrorState from "./ErrorState";

const SectionHeader = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-xs font-medium text-ink-muted tracking-[0.01em]">{label}</span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

const TradeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeField, setActiveField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string | number>("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    };
  }, []);

  const {
    data: entry,
    isLoading,
    error,
  } = useQuery<TradeEntry>({
    queryKey: ["entry", id],
    queryFn: () => {
      if (!id) throw new Error("No id provided");
      return getTradeEntry(id);
    },
    enabled: !!id,
  });

  const { data: accounts } = useQuery({
    queryKey: ["allAccounts"],
    queryFn: getAccounts,
  });

  const updateTradeMutation = useMutation({
    mutationFn: updateTradeEntry,
    onSuccess: (data) => {
      queryClient.setQueryData(["entry", id], data);
      queryClient.invalidateQueries({ queryKey: ["allEntries"] });
      setSaveStatus("saved");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => {
      setSaveStatus("error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTradeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allEntries"] });
      navigate("/dashboard");
    },
    onError: () => {
      setDeleteConfirming(false);
      setDeleteError("Could not delete. Try again.");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setDeleteError(null), 4000);
    },
  });

  if (isLoading) return <LoadingSpinner message="Loading trade details..." />;
  if (error) return <ErrorState message={`Error: ${error.message}`} />;
  if (!entry) return null;

  const {
    accountId,
    result,
    contract,
    direction,
    contracts,
    entryPrice,
    exitPrice,
    stopLoss,
    target,
    entryTime,
    exitTime,
    pnl,
    notes,
  } = entry;

  const formattedEntry = entryTime && formatDateTime(entryTime);
  const formattedExit = exitTime && formatDateTime(exitTime);

  const handleSave = (value = tempValue, field = activeField): void => {
    if (field) {
      if (!id) throw new Error("No id provided");
      let finalValue = value;
      if (
        field === "contracts" ||
        field === "entryPrice" ||
        field === "exitPrice" ||
        field === "stopLoss" ||
        field === "target"
      ) {
        finalValue = Number(value);
      }
      updateTradeMutation.mutate({ id, [field]: finalValue });
      setActiveField(null);
      setTempValue("");
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirming(true);
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    deleteTimerRef.current = setTimeout(() => setDeleteConfirming(false), 4000);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirming(false);
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
  };

  const handleDeleteConfirm = () => {
    if (!id) return;
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    deleteMutation.mutate(id);
  };

  const activate = (field: string, value: string | number) => {
    setActiveField(field);
    setTempValue(value);
  };

  const sharedInputProps = {
    onBlur: () => handleSave(),
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSave();
      if (e.key === "Escape") {
        setActiveField(null);
        setTempValue("");
      }
    },
    autoFocus: true,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      setTempValue(e.target.value);
    },
    value: tempValue,
  };

  return (
    <div className="px-4 py-8 sm:px-8">
      <div className="max-w-5xl mx-auto bg-surface rounded-2xl border border-border overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-ink-muted mb-1">Net P&L</p>
              <p className={`text-xl font-semibold tabular-nums ${pnlColor(pnl)}`}>
                {pnl > 0 ? "+" : ""}{formatCurrency(pnl)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div aria-live="polite" className="text-xs font-medium">
                {saveStatus === "saved" && <span className="text-accent">Saved</span>}
                {saveStatus === "error" && <span className="text-ink-muted">Could not save</span>}
              </div>
              {deleteError && <p className="text-xs text-ink-muted">{deleteError}</p>}
              {deleteConfirming ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-secondary">Delete this trade?</span>
                  <button
                    className="px-2.5 py-1 bg-ink-primary text-white rounded-md text-xs font-medium cursor-pointer transition-colors duration-150 hover:bg-ink-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDeleteConfirm}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    className="px-2.5 py-1 bg-transparent text-ink-secondary border border-border rounded-md text-xs font-medium cursor-pointer transition-colors duration-150 hover:bg-surface-alt"
                    onClick={handleDeleteCancel}
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="px-3.5 py-1.5 bg-transparent text-ink-secondary border border-border rounded-md text-sm cursor-pointer transition-colors duration-150 hover:bg-surface-alt"
                  onClick={handleDeleteClick}
                >
                  Delete Trade
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col lg:flex-row">

          {/* Left: Fields */}
          <div className="flex-1 min-w-0 px-8 py-7 flex flex-col gap-7">

            {/* Session */}
            <div>
              <SectionHeader label="Session" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={panelLabelStyles}>Account</label>
                  <Select
                    id="detail-accountId"
                    value={accountId}
                    onChange={(val) => handleSave(val, "accountId")}
                    options={accounts?.map((a) => ({ value: a._id, label: a.accountName })) ?? []}
                  />
                </div>
                <div>
                  <label className={panelLabelStyles}>Result</label>
                  <Select
                    id="detail-result"
                    value={result}
                    onChange={(val) => handleSave(val, "result")}
                    options={[
                      { value: "Win", label: "Win" },
                      { value: "Loss", label: "Loss" },
                      { value: "Break Even", label: "Break Even" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Instrument */}
            <div>
              <SectionHeader label="Instrument" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={panelLabelStyles}>Contract</label>
                  <Select
                    id="detail-contract"
                    value={contract}
                    onChange={(val) => handleSave(val, "contract")}
                    options={[
                      { value: "NQ", label: "NQ" },
                      { value: "MNQ", label: "MNQ" },
                      { value: "ES", label: "ES" },
                      { value: "MES", label: "MES" },
                    ]}
                  />
                </div>
                <div>
                  <label className={panelLabelStyles}>Direction</label>
                  <Select
                    id="detail-direction"
                    value={direction}
                    onChange={(val) => handleSave(val, "direction")}
                    options={[
                      { value: "Long", label: "Long" },
                      { value: "Short", label: "Short" },
                    ]}
                  />
                </div>
                <div>
                  <label className={panelLabelStyles}>Contracts</label>
                  {activeField === "contracts" ? (
                    <input type="number" className={formInputStyles} {...sharedInputProps} />
                  ) : (
                    <div className={clickValueStyles} onClick={() => activate("contracts", contracts)}>
                      {contracts}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Price Levels */}
            <div>
              <SectionHeader label="Price Levels" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={panelLabelStyles}>Entry Price</label>
                  {activeField === "entryPrice" ? (
                    <input type="number" step="0.01" className={formInputStyles} {...sharedInputProps} />
                  ) : (
                    <div className={clickValueStyles} onClick={() => activate("entryPrice", entryPrice)}>
                      ${entryPrice?.toLocaleString()}
                    </div>
                  )}
                </div>
                <div>
                  <label className={panelLabelStyles}>Exit Price</label>
                  {activeField === "exitPrice" ? (
                    <input type="number" step="0.01" className={formInputStyles} {...sharedInputProps} />
                  ) : (
                    <div className={clickValueStyles} onClick={() => activate("exitPrice", exitPrice)}>
                      ${exitPrice?.toLocaleString()}
                    </div>
                  )}
                </div>
                <div>
                  <label className={panelLabelStyles}>Stop Loss</label>
                  {activeField === "stopLoss" ? (
                    <input type="number" step="0.01" className={formInputStyles} {...sharedInputProps} />
                  ) : (
                    <div className={clickValueStyles} onClick={() => activate("stopLoss", stopLoss)}>
                      ${stopLoss?.toLocaleString()}
                    </div>
                  )}
                </div>
                <div>
                  <label className={panelLabelStyles}>Target</label>
                  {activeField === "target" ? (
                    <input type="number" step="0.01" className={formInputStyles} {...sharedInputProps} />
                  ) : (
                    <div className={clickValueStyles} onClick={() => activate("target", target)}>
                      ${target?.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timing */}
            <div>
              <SectionHeader label="Timing" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={panelLabelStyles}>Entry Time</label>
                  {activeField === "entryTime" ? (
                    <input type="datetime-local" className={formInputStyles} {...sharedInputProps} />
                  ) : (
                    <div className={clickValueStyles} onClick={() => activate("entryTime", toDatetimeLocal(entryTime))}>
                      {formattedEntry}
                    </div>
                  )}
                </div>
                <div>
                  <label className={panelLabelStyles}>Exit Time</label>
                  {activeField === "exitTime" ? (
                    <input type="datetime-local" className={formInputStyles} {...sharedInputProps} />
                  ) : (
                    <div className={clickValueStyles} onClick={() => activate("exitTime", toDatetimeLocal(exitTime))}>
                      {formattedExit}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right: Notes + Images */}
          <div className="lg:w-[400px] shrink-0 border-t border-border lg:border-t-0 lg:border-l bg-surface-alt px-6 py-7 flex flex-col gap-6">
            <div className="flex-1 flex flex-col">
              <p className={panelLabelStyles}>Notes</p>
              <TextEditor key={id} onSave={handleSave} content={notes} />
            </div>
            <div>
              <p className={panelLabelStyles}>Images</p>
              <ImageUpload
                key={`img-${id}`}
                initialUrls={entry.images ?? []}
                maxImages={10}
                onChange={(urls) => {
                  if (!id) return;
                  updateTradeMutation.mutate({ id, images: urls });
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TradeDetail;
