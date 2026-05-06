import { useForm } from "react-hook-form";
import { createNoTradeEntry } from "../api/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import TextEditor from "./TextEditor.js";
import { useState } from "react";
import { CreateNoTradeEntryData } from "../types/noTradeEntry.types";
import { getAccounts } from "../api/api";
import {
  formInputStyles as inputStyles,
  formSelectStyles as selectStyles,
  formLabelStyles as labelStyles,
  formErrorStyles as errorStyles,
} from "../utils/styleConstants";
import LoadingSpinner from "./LoadingSpinner";
import ErrorState from "./ErrorState";

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

  if (isLoading) return <LoadingSpinner message="Loading account details..." />;
  if (error) return <ErrorState message={`Error: ${error.message}`} />;

  const onSubmit = async (data: CreateNoTradeEntryData) => {
    addEntryMutation.mutate({ ...data, notes });
  };

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
