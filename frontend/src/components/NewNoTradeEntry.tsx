import { useForm } from "react-hook-form";
import { createNoTradeEntry } from "../api/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import TextEditor from "./TextEditor.js";
import { useState } from "react";
import { CreateNoTradeEntryData } from "../types/noTradeEntry.types";
import { getAccounts } from "../api/api";

const NewNoTradeEntry = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateNoTradeEntryData>({ mode: "onTouched" });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<string>("");
  const [cancelConfirming, setCancelConfirming] = useState(false);

  const handleCancel = () => {
    if (!isDirty && !notes) {
      navigate(-1);
      return;
    }
    setCancelConfirming(true);
  };

  const addEntryMutation = useMutation({
    mutationFn: createNoTradeEntry,
    onSuccess: (data) => {
      if (!data?._id) {
        console.error("No ID returned from the server.");
        return;
      }

      queryClient.setQueryData(["noTradeEntry", data._id], data);
      queryClient.invalidateQueries({ queryKey: ["allEntries"] });
      navigate(`/dashboard/no-trade-entries/${data._id}`);
      reset();
    },
    onError: (error) => {
      console.error("Failed to create trade entry:", error);
    },
  });

  const {
    data: accounts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["allAccounts"],
    queryFn: getAccounts,
  });

  if (isLoading)
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <div className="w-10 h-10 border-3 border-border border-t-sage rounded-full animate-spin"></div>
        <p className="text-sm text-ink-secondary">Loading account details...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <svg
          className="w-12 h-12 text-red-500"
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
        <p className="text-sm text-red-500">Error: {error.message}</p>
      </div>
    );

  const onSubmit = async (data: CreateNoTradeEntryData) => {
    addEntryMutation.mutate({ ...data, notes });
  };

  const inputStyles =
    "w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-ink-primary outline-none transition-colors focus:border-sage font-inherit";
  const selectStyles = `${inputStyles} cursor-pointer`;
  const labelStyles = "block text-sm font-medium text-ink-secondary mb-1.5";
  const errorStyles = "block text-xs text-red-500 mt-1";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-[800px] mx-auto bg-surface p-8 rounded-2xl border border-border grid grid-cols-1 gap-5"
    >
      <div className="mb-2 pb-4 border-b-2 border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink-primary mb-1">
              Log No Trade Day
            </h2>
            <p className="text-sm text-ink-secondary">
              Record a day you chose not to trade
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            {cancelConfirming ? (
              <>
                <span className="text-xs text-ink-secondary">Discard changes?</span>
                <button
                  type="button"
                  className="px-2.5 py-1 bg-red-500 text-white rounded-md text-xs font-medium cursor-pointer hover:bg-red-600"
                  onClick={() => navigate(-1)}
                >
                  Discard
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 bg-transparent text-ink-secondary border border-border rounded-md text-xs font-medium cursor-pointer hover:bg-surface-alt"
                  onClick={() => setCancelConfirming(false)}
                >
                  Keep editing
                </button>
              </>
            ) : (
              <button
                type="button"
                className="px-3.5 py-1.5 bg-transparent text-ink-secondary border border-border rounded-md text-sm cursor-pointer hover:bg-surface-alt"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        {addEntryMutation.error && (
          <span className="block text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-3">
            {addEntryMutation.error.message}
          </span>
        )}
      </div>
      <div>
        <label className={labelStyles}>Trading Account</label>
        <select
          className={selectStyles}
          {...register("accountId", {
            required: "Selecting a trading account is required.",
          })}
        >
          <option value="">Select a trading account</option>
          {accounts?.map((account) => (
            <option value={account._id} key={account._id}>
              {account.accountName}
            </option>
          ))}
        </select>
        {errors.accountId && (
          <span className={errorStyles}>{errors.accountId.message}</span>
        )}
      </div>
      <div>
        <label className={labelStyles}>Date</label>
        <input
          type="date"
          className={inputStyles}
          {...register("entryTime", { required: "Date is required" })}
        />
        {errors.entryTime && (
          <span className={errorStyles}>{errors.entryTime.message}</span>
        )}
      </div>
      <div>
        <label className={labelStyles}>Notes</label>
        <TextEditor onChange={setNotes} />
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-sage text-surface rounded-lg text-base font-semibold cursor-pointer transition-colors hover:bg-sage-hover mt-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        disabled={addEntryMutation.isPending}
      >
        {addEntryMutation.isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default NewNoTradeEntry;
