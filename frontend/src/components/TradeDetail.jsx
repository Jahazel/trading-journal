import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { getEntry, updateEntry } from "../api/api";
import { useParams } from "react-router-dom";
import { useState } from "react";

const TradeDetail = () => {
  const { id } = useParams();
  const [activeField, setActiveField] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const {
    data: entry,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["entry", id],
    queryFn: () => getEntry(id),
    enabled: !!id,
  });

  const queryClient = useQueryClient();

  const updateTradeMutation = useMutation({
    mutationFn: updateEntry,
    onSuccess: (data) => {
      queryClient.setQueryData(["entry", id], data);
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
    onError: (error) => {
      console.error("Failed to update trade entry", error);
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

  const {
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
    setup,
    notes,
  } = entry || {};

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

  const handleSave = () => {
    if (activeField) {
      updateTradeMutation.mutate({ id, [activeField]: tempValue });
      setActiveField(null);
      setTempValue("");
    }
  };

  return (
    <div className="entry-container">
      <div className="nd-journal">
        <div className="nd-header">
          <div className="nd-breadcrumb">Trading Journal</div>
          <div className="nd-title-row">
            {activeField === "contract" ? (
              <select
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleSave}
                autoFocus
              >
                <option value="NQ">NQ</option>
                <option value="MNQ">MNQ</option>
                <option value="ES">ES</option>
                <option value="MES">MES</option>
              </select>
            ) : (
              <span
                className="nd-ticker"
                onClick={() => {
                  setActiveField("contract");
                  setTempValue(contract);
                }}
              >
                {contract}
              </span>
            )}

            {activeField === "direction" ? (
              <select
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleSave}
                autoFocus
              >
                <option value="Long">Long</option>
                <option value="Short">Short</option>
              </select>
            ) : (
              <span
                className={`nd-badge ${direction?.toLowerCase()}`}
                onClick={() => {
                  setActiveField("direction");
                  setTempValue(direction);
                }}
              >
                {direction}
              </span>
            )}

            <span className={`nd-pnl ${isProfit ? "profit" : "loss"}`}>
              {isProfit ? "+" : ""}${pnl?.toLocaleString()}
            </span>
          </div>
          <div className="nd-meta">
            Entry: {formattedEntry} &nbsp;&middot;&nbsp; Exit: {formattedExit}
          </div>
        </div>

        <div className="nd-body">
          <div className="nd-section">
            <div className="nd-section-label">Position</div>
            <div className="nd-stats-row">
              <div className="nd-stat">
                <span className="nd-stat-label">Contracts</span>
                {activeField === "contracts" ? (
                  <input
                    type="number"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    className="nd-stat-value"
                    onClick={() => {
                      setActiveField("contracts");
                      setTempValue(contracts);
                    }}
                  >
                    {contracts}
                  </span>
                )}
              </div>

              <div className="nd-stat">
                <span className="nd-stat-label">Entry Price</span>
                {activeField === "entryPrice" ? (
                  <input
                    type="number"
                    step="0.01"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    className="nd-stat-value"
                    onClick={() => {
                      setActiveField("entryPrice");
                      setTempValue(entryPrice);
                    }}
                  >
                    ${entryPrice?.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="nd-stat">
                <span className="nd-stat-label">Exit Price</span>
                {activeField === "exitPrice" ? (
                  <input
                    type="number"
                    step="0.01"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    className="nd-stat-value"
                    onClick={() => {
                      setActiveField("exitPrice");
                      setTempValue(exitPrice);
                    }}
                  >
                    ${exitPrice?.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="nd-stat">
                <span className="nd-stat-label">Stop Loss</span>
                {activeField === "stopLoss" ? (
                  <input
                    type="number"
                    step="0.01"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    className="nd-stat-value"
                    onClick={() => {
                      setActiveField("stopLoss");
                      setTempValue(stopLoss);
                    }}
                  >
                    ${stopLoss?.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="nd-stat">
                <span className="nd-stat-label">Target</span>
                {activeField === "target" ? (
                  <input
                    type="number"
                    step="0.01"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    className="nd-stat-value"
                    onClick={() => {
                      setActiveField("target");
                      setTempValue(target);
                    }}
                  >
                    ${target?.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {activeField === "setup" ? (
            <input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              autoFocus
            />
          ) : (
            <div className="nd-section">
              <div className="nd-section-label">Setup</div>
              {setup ? (
                <div
                  className="nd-prose-block"
                  onClick={() => {
                    setActiveField("setup");
                    setTempValue(setup);
                  }}
                >
                  {setup}
                </div>
              ) : (
                <div
                  className="nd-prose-block nd-prose-empty"
                  onClick={() => {
                    setActiveField("setup");
                    setTempValue("");
                  }}
                >
                  No setup recorded.
                </div>
              )}
            </div>
          )}

          {activeField === "notes" ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSave();
              }}
              autoFocus
            />
          ) : (
            <div className="nd-section">
              <div className="nd-section-label">Notes</div>
              {notes ? (
                <div
                  className="nd-prose-block"
                  onClick={() => {
                    setActiveField("notes");
                    setTempValue(notes);
                  }}
                >
                  {notes}
                </div>
              ) : (
                <div
                  className="nd-prose-block nd-prose-empty"
                  onClick={() => {
                    setActiveField("notes");
                    setTempValue("");
                  }}
                >
                  No notes added.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeDetail;
