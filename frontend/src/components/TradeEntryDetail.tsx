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
import { getAccounts } from "../api/api.js";

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

  const { data: accounts } = useQuery({
    queryKey: ["allAccounts"],
    queryFn: getAccounts,
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

  const resultColors: Record<string, string> = {
    Win: "text-emerald-500",
    Loss: "text-red-500",
    "Break Even": "text-blue-500",
  };

  const rowStyles =
    "flex items-center min-h-[44px] border-b border-gray-200 cursor-pointer gap-4 hover:bg-gray-50 hover:mx-[-32px] hover:px-8";
  const labelStyles = "text-sm text-gray-500 w-30 min-w-30 font-medium";
  const valueStyles = "flex-1 text-sm text-gray-900";
  const inlineInputStyles =
    "font-inherit text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-md outline-none transition-colors focus:border-blue-500 px-2 py-1 w-full";

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-[680px] mx-auto bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-8 pt-7 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <div className="text-xs font-medium text-gray-400 tracking-wide uppercase mb-0.5">
                Net P&L
              </div>
              <div
                className={`text-2xl font-medium tabular-nums mb-1.5 ${resultColors[result]}`}
              >
                $
                {Math.abs(pnl)?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <button
              className="px-3.5 py-1.5 bg-transparent text-red-500 border border-red-500 rounded-md text-sm cursor-pointer transition-colors hover:bg-red-500 hover:text-white"
              onClick={handleDelete}
            >
              Delete Trade
            </button>
          </div>
          <div className="text-sm text-gray-400">
            Entry: {formattedEntry} &nbsp;&middot;&nbsp; Exit: {formattedExit}
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
                  className={`inline-block text-xs font-semibold py-0.5 rounded tracking-wide ${direction?.toLowerCase() === "long" ? "text-emerald-500" : "text-red-500"}`}
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
