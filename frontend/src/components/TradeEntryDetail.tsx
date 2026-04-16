import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteTradeEntry,
  getTradeEntry,
  updateTradeEntry,
} from "../api/api.js";
import { useParams, useNavigate } from "react-router-dom";
import { useState, ChangeEvent, KeyboardEvent } from "react";
import TextEditor from "./TextEditor.js";
import { TradeEntry } from "../types/tradeEntry.types.js";

const TradeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeField, setActiveField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string | number>("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const updateTradeMutation = useMutation({
    mutationFn: updateTradeEntry,
    onSuccess: (data) => {
      queryClient.setQueryData(["entry", id], data);
      queryClient.invalidateQueries({ queryKey: ["allEntries"] });
    },
    onError: (error) => {
      console.error("Failed to update trade entry", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTradeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allEntries"] });
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("Failed to delete trade entry", error);
    },
  });

  if (isLoading)
    return (
      <div className="entry-loading">
        <div className="loading-spinner"></div>
        <p>Loading trade details...</p>
      </div>
    );

  if (error)
    return (
      <div className="entry-error">
        <svg
          className="error-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>Error: {error.message}</p>
      </div>
    );

  if (!entry) return null;

  const {
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

  const isProfit = pnl > 0;

  const formattedEntry =
    entryTime &&
    new Date(entryTime).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const formattedExit =
    exitTime &&
    new Date(exitTime).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const toDatetimeLocal = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

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

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this trade?")) {
      if (!id) throw new Error("No id provided");

      deleteMutation.mutate(id);
    }
  };

  const activate = (field: string, value: string | number) => {
    setActiveField(field);
    setTempValue(value);
  };

  const sharedInputProps = {
    onBlur: () => handleSave(),
    onKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (e.key === "Enter") handleSave();
    },
    autoFocus: true,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setTempValue(e.target.value);
    },
    value: tempValue,
  };

  return (
    <div className="entry-container">
      <div className="nd-journal">
        <div className="nd-header">
          <div className="nd-header-top">
            <div>
              <div className="nd-pnl-label">Net P&L</div>
              <div className={`nd-pnl ${isProfit ? "profit" : "loss"}`}>
                $
                {Math.abs(pnl)?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <button className="delete-btn" onClick={handleDelete}>
              Delete Trade
            </button>
          </div>
          <div className="nd-meta">
            Entry: {formattedEntry} &nbsp;&middot;&nbsp; Exit: {formattedExit}
          </div>
        </div>
        <div className="nd-properties">
          <div
            className="nd-row"
            onClick={() => !activeField && activate("result", result)}
          >
            <span className="nd-label">Result</span>
            <div className="nd-value">
              {activeField === "result" ? (
                <select {...sharedInputProps}>
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
            className="nd-row"
            onClick={() => !activeField && activate("contract", contract)}
          >
            <span className="nd-label">Contract</span>
            <div className="nd-value">
              {activeField === "contract" ? (
                <select {...sharedInputProps}>
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
            className="nd-row"
            onClick={() => !activeField && activate("direction", direction)}
          >
            <span className="nd-label">Direction</span>
            <div className="nd-value">
              {activeField === "direction" ? (
                <select
                  {...sharedInputProps}
                  className="direction-select"
                  onChange={(e) => {
                    setTempValue(e.target.value);
                    handleSave(e.target.value);
                  }}
                >
                  <option value="Long">Long</option>
                  <option value="Short">Short</option>
                </select>
              ) : (
                <span className={`nd-badge ${direction?.toLowerCase()}`}>
                  {direction}
                </span>
              )}
            </div>
          </div>
          <div
            className="nd-row"
            onClick={() => !activeField && activate("contracts", contracts)}
          >
            <span className="nd-label">Contracts</span>
            <div className="nd-value">
              {activeField === "contracts" ? (
                <input type="number" {...sharedInputProps} />
              ) : (
                <span>{contracts}</span>
              )}
            </div>
          </div>
          <div
            className="nd-row"
            onClick={() => !activeField && activate("entryPrice", entryPrice)}
          >
            <span className="nd-label">Entry Price</span>
            <div className="nd-value">
              {activeField === "entryPrice" ? (
                <input type="number" step="0.01" {...sharedInputProps} />
              ) : (
                <span>${entryPrice?.toLocaleString()}</span>
              )}
            </div>
          </div>
          <div
            className="nd-row"
            onClick={() => !activeField && activate("exitPrice", exitPrice)}
          >
            <span className="nd-label">Exit Price</span>
            <div className="nd-value">
              {activeField === "exitPrice" ? (
                <input type="number" step="0.01" {...sharedInputProps} />
              ) : (
                <span>${exitPrice?.toLocaleString()}</span>
              )}
            </div>
          </div>
          <div
            className="nd-row"
            onClick={() => !activeField && activate("stopLoss", stopLoss)}
          >
            <span className="nd-label">Stop Loss</span>
            <div className="nd-value">
              {activeField === "stopLoss" ? (
                <input type="number" step="0.01" {...sharedInputProps} />
              ) : (
                <span>${stopLoss?.toLocaleString()}</span>
              )}
            </div>
          </div>
          <div
            className="nd-row"
            onClick={() => !activeField && activate("target", target)}
          >
            <span className="nd-label">Target</span>
            <div className="nd-value">
              {activeField === "target" ? (
                <input type="number" step="0.01" {...sharedInputProps} />
              ) : (
                <span>${target?.toLocaleString()}</span>
              )}
            </div>
          </div>
          <div
            className="nd-row"
            onClick={() =>
              !activeField && activate("entryTime", toDatetimeLocal(entryTime))
            }
          >
            <span className="nd-label">Entry Time</span>
            <div className="nd-value">
              {activeField === "entryTime" ? (
                <input type="datetime-local" {...sharedInputProps} />
              ) : (
                <span>{formattedEntry}</span>
              )}
            </div>
          </div>
          <div
            className="nd-row"
            onClick={() =>
              !activeField && activate("exitTime", toDatetimeLocal(exitTime))
            }
          >
            <span className="nd-label">Exit Time</span>
            <div className="nd-value">
              {activeField === "exitTime" ? (
                <input type="datetime-local" {...sharedInputProps} />
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
