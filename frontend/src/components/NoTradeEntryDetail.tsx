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

  const { data: accounts } = useQuery({
    queryKey: ["allAccounts"],
    queryFn: getAccounts,
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

  if (isLoading) return <LoadingSpinner message="Loading trade details..." />;
  if (error) return <ErrorState message={`Error: ${error.message}`} />;

  if (!entry) return null;

  const { accountId, entryTime, notes } = entry;

  const formattedDate = entryTime && formatDateTime(entryTime);

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
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-[680px] mx-auto bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-8 pt-7 pb-6 border-b border-border">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <p className="text-xs font-medium text-ink-muted tracking-wide uppercase mb-0.5">
                No Trade Day
              </p>
              <p className="text-sm text-ink-muted">{formattedDate}</p>
            </div>
            <button
              className="px-3.5 py-1.5 bg-transparent text-red-500 border border-red-500 rounded-md text-sm cursor-pointer transition-colors hover:bg-red-500 hover:text-white"
              onClick={handleDelete}
            >
              Delete Entry
            </button>
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
          <TextEditor key={id} onSave={handleSave} content={notes} />
        </div>
      </div>
    </div>
  );
};
export default NoTradeEntryDetail;
