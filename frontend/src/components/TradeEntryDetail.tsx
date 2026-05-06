import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteTradeEntry,
  getTradeEntry,
  updateTradeEntry,
} from "../api/api.js";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import TextEditor from "./TextEditor.js";
import { TradeEntry } from "../types/tradeEntry.types.js";
import { getAccounts } from "../api/api.js";
import { formatCurrency, resultColorClass, toDatetimeLocal, formatDateTime } from "../utils/formatUtils";
import {
  detailRowStyles as rowStyles,
  detailLabelStyles as labelStyles,
  detailValueStyles as valueStyles,
  detailInputStyles as inlineInputStyles,
} from "../utils/styleConstants";
import LoadingSpinner from "./LoadingSpinner";
import ErrorState from "./ErrorState";

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
    onKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (e.key === "Enter") handleSave();
      if (e.key === "Escape") {
        setActiveField(null);
        setTempValue("");
      }
    },
    autoFocus: true,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setTempValue(e.target.value);
    },
    value: tempValue,
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-[680px] mx-auto bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-8 pt-7 pb-6 border-b border-border">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <div className="text-xs font-medium text-ink-muted tracking-wide uppercase mb-0.5">
                Net P&L
              </div>
              <div
                className={`text-2xl font-medium tabular-nums mb-1.5 ${resultColorClass(result)}`}
              >
                {formatCurrency(Math.abs(pnl))}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {deleteConfirming ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-secondary">Delete this trade?</span>
                  <button
                    className="px-2.5 py-1 bg-red-500 text-white rounded-md text-xs font-medium cursor-pointer transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDeleteConfirm}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    className="px-2.5 py-1 bg-transparent text-ink-secondary border border-border rounded-md text-xs font-medium cursor-pointer transition-colors hover:bg-surface-alt"
                    onClick={handleDeleteCancel}
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="px-3.5 py-1.5 bg-transparent text-red-500 border border-red-500 rounded-md text-sm cursor-pointer transition-colors hover:bg-red-500 hover:text-white"
                  onClick={handleDeleteClick}
                >
                  Delete Trade
                </button>
              )}

              {deleteError && (
                <p className="text-xs text-red-500">{deleteError}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-ink-muted">
              Entry: {formattedEntry} &nbsp;&middot;&nbsp; Exit: {formattedExit}
            </div>
            <div
              aria-live="polite"
              className="text-xs font-medium transition-opacity duration-300"
            >
              {saveStatus === "saved" && (
                <span className="text-emerald-600">Saved</span>
              )}
              {saveStatus === "error" && (
                <span className="text-red-500">Could not save</span>
              )}
            </div>
          </div>
        </div>

        <div className="px-8">
          <div
            className={rowStyles}
            onClick={() => !activeField && activate("accountId", accountId)}
          >
            <span className={labelStyles}>Account</span>
            <div className={valueStyles}>
              {activeField === "accountId" ? (
                <select className={inlineInputStyles} {...sharedInputProps}>
                  {accounts?.map((account) => (
                    <option value={account._id} key={account._id}>
                      {account.accountName}
                    </option>
                  ))}
                </select>
              ) : (
                <span>
                  {accounts?.find((account) => account._id === accountId)
                    ?.accountName ?? "No account"}
                </span>
              )}
            </div>
          </div>
          <div
            className={rowStyles}
            onClick={() => !activeField && activate("result", result)}
          >
            <span className={labelStyles}>Result</span>
            <div className={valueStyles}>
              {activeField === "result" ? (
                <select className={inlineInputStyles} {...sharedInputProps}>
                  <option value="Win">Win</option>
                  <option value="Loss">Loss</option>
                  <option value="Break Even">Break Even</option>
                </select>
              ) : (
                <span>{result}</span>
              )}
            </div>
          </div>
          <div
            className={rowStyles}
            onClick={() => !activeField && activate("contract", contract)}
          >
            <span className={labelStyles}>Contract</span>
            <div className={valueStyles}>
              {activeField === "contract" ? (
                <select className={inlineInputStyles} {...sharedInputProps}>
                  <option value="NQ">NQ</option>
                  <option value="MNQ">MNQ</option>
                  <option value="ES">ES</option>
                  <option value="MES">MES</option>
                </select>
              ) : (
                <span>{contract}</span>
              )}
            </div>
          </div>
          <div
            className={rowStyles}
            onClick={() => !activeField && activate("direction", direction)}
          >
            <span className={labelStyles}>Direction</span>
            <div className={valueStyles}>
              {activeField === "direction" ? (
                <select
                  className={inlineInputStyles}
                  {...sharedInputProps}
                  onChange={(e) => {
                    setTempValue(e.target.value);
                    handleSave(e.target.value);
                  }}
                >
                  <option value="Long">Long</option>
                  <option value="Short">Short</option>
                </select>
              ) : (
                <span
                  className={`inline-block text-xs font-semibold py-0.5 rounded tracking-wide ${direction?.toLowerCase() === "long" ? "text-emerald-600" : "text-red-600"}`}
                >
                  {direction}
                </span>
              )}
            </div>
          </div>
          <div
            className={rowStyles}
            onClick={() => !activeField && activate("contracts", contracts)}
          >
            <span className={labelStyles}>Contracts</span>
            <div className={valueStyles}>
              {activeField === "contracts" ? (
                <input
                  type="number"
                  className={inlineInputStyles}
                  {...sharedInputProps}
                />
              ) : (
                <span>{contracts}</span>
              )}
            </div>
          </div>
          <div
            className={rowStyles}
            onClick={() => !activeField && activate("entryPrice", entryPrice)}
          >
            <span className={labelStyles}>Entry Price</span>
            <div className={valueStyles}>
              {activeField === "entryPrice" ? (
                <input
                  type="number"
                  step="0.01"
                  className={inlineInputStyles}
                  {...sharedInputProps}
                />
              ) : (
                <span>${entryPrice?.toLocaleString()}</span>
              )}
            </div>
          </div>
          <div
            className={rowStyles}
            onClick={() => !activeField && activate("exitPrice", exitPrice)}
          >
            <span className={labelStyles}>Exit Price</span>
            <div className={valueStyles}>
              {activeField === "exitPrice" ? (
                <input
                  type="number"
                  step="0.01"
                  className={inlineInputStyles}
                  {...sharedInputProps}
                />
              ) : (
                <span>${exitPrice?.toLocaleString()}</span>
              )}
            </div>
          </div>
          <div
            className={rowStyles}
            onClick={() => !activeField && activate("stopLoss", stopLoss)}
          >
            <span className={labelStyles}>Stop Loss</span>
            <div className={valueStyles}>
              {activeField === "stopLoss" ? (
                <input
                  type="number"
                  step="0.01"
                  className={inlineInputStyles}
                  {...sharedInputProps}
                />
              ) : (
                <span>${stopLoss?.toLocaleString()}</span>
              )}
            </div>
          </div>
          <div
            className={rowStyles}
            onClick={() => !activeField && activate("target", target)}
          >
            <span className={labelStyles}>Target</span>
            <div className={valueStyles}>
              {activeField === "target" ? (
                <input
                  type="number"
                  step="0.01"
                  className={inlineInputStyles}
                  {...sharedInputProps}
                />
              ) : (
                <span>${target?.toLocaleString()}</span>
              )}
            </div>
          </div>
          <div
            className={rowStyles}
            onClick={() =>
              !activeField && activate("entryTime", toDatetimeLocal(entryTime))
            }
          >
            <span className={labelStyles}>Entry Time</span>
            <div className={valueStyles}>
              {activeField === "entryTime" ? (
                <input
                  type="datetime-local"
                  className={inlineInputStyles}
                  {...sharedInputProps}
                />
              ) : (
                <span>{formattedEntry}</span>
              )}
            </div>
          </div>
          <div
            className={`${rowStyles} border-b-0`}
            onClick={() =>
              !activeField && activate("exitTime", toDatetimeLocal(exitTime))
            }
          >
            <span className={labelStyles}>Exit Time</span>
            <div className={valueStyles}>
              {activeField === "exitTime" ? (
                <input
                  type="datetime-local"
                  className={inlineInputStyles}
                  {...sharedInputProps}
                />
              ) : (
                <span>{formattedExit}</span>
              )}
            </div>
          </div>
          <TextEditor key={id} onSave={handleSave} content={notes} />
        </div>
      </div>
    </div>
  );
};

export default TradeDetail;
