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

  const rowStyles =
    "flex items-center min-h-[44px] border-b border-gray-200 cursor-pointer gap-4 hover:bg-gray-50 hover:mx-[-32px] hover:px-8";
  const labelStyles = "text-sm text-gray-500 w-30 min-w-30 font-medium";
  const valueStyles = "flex-1 text-sm text-gray-900";
  const inlineInputStyles =
    "font-inherit text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-md outline-none transition-colors focus:border-blue-500 px-2 py-1 w-full";

  if (isLoading)
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 h-[400px] text-gray-500">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p>Loading trade details...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 h-[400px] text-red-500 bg-red-50 rounded-2xl m-5">
        <svg
          className="w-12 h-12"
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

  const { accountId, entryTime, notes } = entry;

  const formattedDate =
    entryTime &&
    new Date(entryTime).toLocaleString("en-US", {
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
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-[680px] mx-auto bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-8 pt-7 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <p className="text-xs font-medium text-gray-400 tracking-wide uppercase mb-0.5">
                No Trade Day
              </p>
              <p className="text-sm text-gray-400">{formattedDate}</p>
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
