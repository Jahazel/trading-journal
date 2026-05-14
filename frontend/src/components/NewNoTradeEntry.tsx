import { useForm } from "react-hook-form";
import { createNoTradeEntry } from "../api/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import TextEditor from "./TextEditor.js";
import ImageUpload from "./ImageUpload";
import { useState } from "react";
import { CreateNoTradeEntryData } from "../types/noTradeEntry.types";
import { getAccounts } from "../api/api";
import AccountModal from "./AccountModal";
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
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreateNoTradeEntryData>({ mode: "onTouched" });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [cancelConfirming, setCancelConfirming] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);

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
      console.error("Failed to create no-trade entry:", error);
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
    addEntryMutation.mutate({ ...data, notes, images: uploadedImages });
  };

  return (
    <div className="px-8 py-10">
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-[800px] mx-auto bg-surface p-8 rounded-2xl border border-border grid grid-cols-1 gap-5"
    >
      {/* Header */}
      <div className="mb-2 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold text-ink-primary">Log No Trade Day</h2>
          <div className="flex items-center gap-2 pt-0.5">
            {cancelConfirming ? (
              <>
                <span className="text-xs text-ink-secondary">Discard changes?</span>
                <button
                  type="button"
                  className="px-2.5 py-1 bg-red-500 text-white rounded-md text-xs font-medium cursor-pointer hover:bg-red-600 transition-colors duration-100"
                  onClick={() => navigate(-1)}
                >
                  Discard
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 bg-transparent text-ink-secondary border border-border rounded-md text-xs font-medium cursor-pointer hover:bg-surface-alt transition-colors duration-100"
                  onClick={() => setCancelConfirming(false)}
                >
                  Keep editing
                </button>
              </>
            ) : (
              <button
                type="button"
                className="px-3.5 py-1.5 bg-transparent text-ink-secondary border border-border rounded-md text-sm cursor-pointer hover:bg-surface-alt transition-colors duration-100"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        {addEntryMutation.error && (
          <p className="mt-3 text-sm text-ink-secondary bg-surface-alt border border-border rounded-md px-3 py-2">
            {addEntryMutation.error.message}
          </p>
        )}
      </div>

      {/* Account */}
      <div>
        <label className={labelStyles}>Trading Account</label>
        {accounts && accounts.length === 0 ? (
          <button
            type="button"
            onClick={() => setAddingAccount(true)}
            className="text-sm text-ink-muted hover:text-ink-primary transition-colors duration-150 cursor-pointer"
          >
            + New Account
          </button>
        ) : (
          <select
            className={selectStyles}
            {...register("accountId", { required: "Selecting a trading account is required." })}
            onChange={(e) => {
              if (e.target.value === "__new__") { setAddingAccount(true); setValue("accountId", ""); }
            }}
          >
            <option value="">Select a trading account</option>
            {accounts?.map((account) => (
              <option value={account._id} key={account._id}>{account.accountName}</option>
            ))}
            <option value="__new__">+ Add new account</option>
          </select>
        )}
        {errors.accountId && (
          <span className={errorStyles}>{errors.accountId.message}</span>
        )}
      </div>

      {addingAccount && (
        <AccountModal
          onClose={() => setAddingAccount(false)}
          onSuccess={(acc) => setValue("accountId", acc._id)}
        />
      )}

      {/* Date */}
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

      {/* Notes */}
      <div>
        <label className={labelStyles}>Notes</label>
        <TextEditor onChange={setNotes} />
      </div>

      {/* Images */}
      <div>
        <label className={labelStyles}>Images</label>
        <ImageUpload onChange={setUploadedImages} maxImages={5} />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3 bg-accent text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors duration-150 hover:bg-accent-hover mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={addEntryMutation.isPending}
      >
        {addEntryMutation.isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
    </div>
  );
};

export default NewNoTradeEntry;
