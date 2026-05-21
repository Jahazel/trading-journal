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
      <div className="max-w-4xl mx-auto bg-surface rounded-2xl border border-border overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-ink-muted mb-1">No Trade</p>
              <p className="text-xl font-semibold text-ink-primary">{formattedDate}</p>
            </div>
            <div className="flex items-center gap-3">
              <div aria-live="polite" className="text-xs font-medium">
                {saveStatus === "saved" && <span className="text-accent">Saved</span>}
                {saveStatus === "error" && <span className="text-ink-muted">Could not save</span>}
              </div>
              {deleteError && <p className="text-xs text-ink-muted">{deleteError}</p>}
              {deleteConfirming ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-secondary">Delete this entry?</span>
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
                  Delete Entry
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col lg:flex-row">

          {/* Left: Fields */}
          <div className="lg:w-[280px] shrink-0 px-8 py-7 flex flex-col gap-5">
            <div>
              <SectionHeader label="Session" />
              <div className="flex flex-col gap-4">
                <div>
                  <label className={panelLabelStyles}>Account</label>
                  <Select
                    id="detail-nte-accountId"
                    value={accountId}
                    onChange={(val) => handleSave(val, "accountId")}
                    options={accounts?.map((a) => ({ value: a._id, label: a.accountName })) ?? []}
                  />
                </div>
                <div>
                  <label className={panelLabelStyles}>Date</label>
                  {activeField === "entryTime" ? (
                    <input type="datetime-local" className={formInputStyles} {...sharedInputProps} />
                  ) : (
                    <div className={clickValueStyles} onClick={() => activate("entryTime", entryTime)}>
                      {formattedDate}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Notes + Images */}
          <div className="flex-1 min-w-0 border-t border-border lg:border-t-0 lg:border-l bg-surface-alt px-6 py-7 flex flex-col gap-6">
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
                  updateMutation.mutate({ id, images: urls });
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NoTradeEntryDetail;
