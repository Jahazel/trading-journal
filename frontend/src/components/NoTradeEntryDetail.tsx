import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteNoTradeEntry,
  getNoTradeEntry,
  updateNoTradeEntry,
} from "../api/api.js";
import { useParams, useNavigate } from "react-router-dom";
import { useState, KeyboardEvent, ChangeEvent } from "react";
import TextEditor from "./TextEditor.js";
import { NoTradeEntry } from "../types/noTradeEntry.types.js";

const NoTradeEntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeField, setActiveField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: entry,
    isLoading,
    error,
  } = useQuery<NoTradeEntry>({
    queryKey: ["noTradeEntry", id],
    queryFn: () => {
      if (!id) throw new Error("No id provided");

      return getNoTradeEntry(id);
    },
    enabled: !!id,
  });

  const updateTradeMutation = useMutation({
    mutationFn: updateNoTradeEntry,
    onSuccess: (data) => {
      queryClient.setQueryData(["noTradeEntry", id], data);
      queryClient.invalidateQueries({ queryKey: ["allEntries"] });
    },
    onError: (error) => {
      console.error("Failed to update trade entry", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNoTradeEntry,
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

  const { date, notes } = entry;

  const formattedDate =
    date &&
    new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const handleSave = (value = tempValue, field = activeField) => {
    if (field) {
      if (!id) throw new Error("No id provided");

      updateTradeMutation.mutate({ id, [field]: value });
      setActiveField(null);
      setTempValue("");
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      if (!id) throw new Error("No id provided");

      deleteMutation.mutate(id);
    }
  };

  const activate = (field: string, value: string) => {
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
              <p className="nd-pnl-label">No Trade Day</p>
              <p className="nd-meta">{formattedDate}</p>
            </div>
            <button className="delete-btn" onClick={handleDelete}>
              Delete Entry
            </button>
          </div>
        </div>
        <div className="nd-properties">
          <div
            className="nd-row"
            onClick={() => !activeField && activate("date", date)}
          >
            <span className="nd-label">Date</span>
            <div className="nd-value">
              {activeField === "date" ? (
                <input type="datetime-local" {...sharedInputProps} />
              ) : (
                <span>{formattedDate}</span>
              )}
            </div>
          </div>
          <TextEditor key={id} onSave={handleSave} content={notes} />
        </div>
      </div>
    </div>
  );
};
export default NoTradeEntryDetail;
