import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteNoTradeEntry,
  getNoTradeEntry,
  updateNoTradeEntry,
} from "../api/api.js";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import TextEditor from "./TextEditor.js";
import ImageUpload from "./ImageUpload";
import { NoTradeEntry } from "../types/noTradeEntry.types.js";
import { getAccounts } from "../api/api.js";
import { formatDateTime } from "../utils/formatUtils";
import {
  detailRowStyles as rowStyles,
  detailLabelStyles as labelStyles,
  detailValueStyles as valueStyles,
  detailInputStyles as inlineInputStyles,
} from "../utils/styleConstants";
import LoadingSpinner from "./LoadingSpinner";
import ErrorState from "./ErrorState";

const NoTradeEntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeField, setActiveField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
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
  } = useQuery<NoTradeEntry>({
    queryKey: ["noTradeEntry", id],
    queryFn: () => {
      if (!id) throw new Error("No id provided");
      return getNoTradeEntry(id);
    },
    enabled: !!id,
  });

  const { data: accounts } = useQuery({
    queryKey: ["allAccounts"],
    queryFn: getAccounts,
  });

  const updateMutation = useMutation({
    mutationFn: updateNoTradeEntry,
    onSuccess: (data) => {
      queryClient.setQueryData(["noTradeEntry", id], data);
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
    mutationFn: deleteNoTradeEntry,
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

  if (isLoading) return <LoadingSpinner message="Loading entry details..." />;
  if (error) return <ErrorState message={`Error: ${error.message}`} />;
  if (!entry) return null;

  const { accountId, entryTime, notes } = entry;
  const formattedDate = entryTime && formatDateTime(entryTime);

  const handleSave = (value = tempValue, field = activeField) => {
    if (field) {
      if (!id) throw new Error("No id provided");
      updateMutation.mutate({ id, [field]: value });
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

  const activate = (field: string, value: string) => {
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
    <div className="px-8 py-10">
      <div className="max-w-[680px] mx-auto bg-surface rounded-xl border border-border overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-7 pb-6 border-b border-border">
          <div className="flex items-start justify-between mb-1.5">
            <div>
              <p className="text-xs font-medium text-ink-muted mb-0.5">No Trade</p>
              <p className="text-sm text-ink-secondary">{formattedDate}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              {deleteConfirming ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-secondary">Delete this entry?</span>
                  <button
                    className="px-2.5 py-1 bg-red-500 text-white rounded-md text-xs font-medium cursor-pointer transition-colors duration-100 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDeleteConfirm}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    className="px-2.5 py-1 bg-transparent text-ink-secondary border border-border rounded-md text-xs font-medium cursor-pointer transition-colors duration-100 hover:bg-surface-alt"
                    onClick={handleDeleteCancel}
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="px-3.5 py-1.5 bg-transparent text-red-500 border border-red-500 rounded-md text-sm cursor-pointer transition-colors duration-100 hover:bg-red-500 hover:text-white"
                  onClick={handleDeleteClick}
                >
                  Delete Entry
                </button>
              )}
              {deleteError && (
                <p className="text-xs text-ink-muted">{deleteError}</p>
              )}
            </div>
          </div>

          <div aria-live="polite" className="text-xs font-medium transition-opacity duration-300 text-right">
            {saveStatus === "saved" && (
              <span className="text-accent">Saved</span>
            )}
            {saveStatus === "error" && (
              <span className="text-ink-muted">Could not save</span>
            )}
          </div>
        </div>

        {/* Fields */}
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
                  {accounts?.find((a) => a._id === accountId)?.accountName ?? "No account"}
                </span>
              )}
            </div>
          </div>

          <div
            className={`${rowStyles} border-b-0`}
            onClick={() => !activeField && activate("entryTime", entryTime)}
          >
            <span className={labelStyles}>Date</span>
            <div className={valueStyles}>
              {activeField === "entryTime" ? (
                <input
                  type="datetime-local"
                  className={inlineInputStyles}
                  {...sharedInputProps}
                />
              ) : (
                <span>{formattedDate}</span>
              )}
            </div>
          </div>

          <div className="py-5 border-t border-border">
            <p className="text-sm font-medium text-ink-secondary mb-3">Images</p>
            <ImageUpload
              key={id}
              initialUrls={entry.images ?? []}
              maxImages={5}
              onChange={(urls) => {
                if (!id) return;
                updateMutation.mutate({ id, images: urls });
              }}
            />
          </div>

          <TextEditor key={id} onSave={handleSave} content={notes} />
        </div>
      </div>
    </div>
  );
};

export default NoTradeEntryDetail;
