import { useForm, Controller } from "react-hook-form";
import { createNoTradeEntry } from "../api/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import TextEditor from "./TextEditor.js";
import ImageUpload from "./ImageUpload";
import { useState } from "react";
import { CreateNoTradeEntryData } from "../types/noTradeEntry.types";
import { getAccounts } from "../api/api";
import AccountModal from "./AccountModal";
import Select from "./Select";
import {
  formInputStyles as inputStyles,
  formLabelStyles as labelStyles,
  formErrorStyles as errorStyles,
} from "../utils/styleConstants";
import LoadingSpinner from "./LoadingSpinner";
import ErrorState from "./ErrorState";

const SectionHeader = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-xs font-medium text-ink-muted tracking-[0.01em]">{label}</span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

const NewNoTradeEntry = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
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

  const accountOptions = [
    ...(accounts?.map((a) => ({ value: a._id, label: a.accountName })) ?? []),
    { value: "__new__", label: "+ Add new account" },
  ];

  return (
    <div className="px-4 py-8 sm:px-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto bg-surface rounded-2xl border border-border overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-ink-primary">Log No Trade Day</h2>
            <div className="flex items-center gap-2">
              {cancelConfirming ? (
                <>
                  <span className="text-xs text-ink-secondary">Discard changes?</span>
                  <button
                    type="button"
                    className="px-2.5 py-1 bg-ink-primary text-white rounded-md text-xs font-medium cursor-pointer hover:bg-ink-secondary transition-colors duration-150"
                    onClick={() => navigate(-1)}
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    className="px-2.5 py-1 bg-transparent text-ink-secondary border border-border rounded-md text-xs font-medium cursor-pointer hover:bg-surface-alt transition-colors duration-150"
                    onClick={() => setCancelConfirming(false)}
                  >
                    Keep editing
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="px-3.5 py-1.5 bg-transparent text-ink-secondary border border-border rounded-md text-sm cursor-pointer hover:bg-surface-alt transition-colors duration-150"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          {addEntryMutation.error && (
            <p className="mt-4 text-sm text-ink-secondary bg-surface-alt border border-border rounded-lg px-3 py-2">
              {addEntryMutation.error.message}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col lg:flex-row">

          {/* Left: Session Metadata */}
          <div className="lg:w-[280px] shrink-0 px-8 py-7 flex flex-col gap-5">
            <SectionHeader label="Session" />

            <div>
              <label className={labelStyles} htmlFor="nte-accountId">Trading Account</label>
              {accounts && accounts.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setAddingAccount(true)}
                  className="text-sm text-ink-muted hover:text-ink-primary transition-colors duration-150 cursor-pointer"
                >
                  New Account
                </button>
              ) : (
                <Controller
                  control={control}
                  name="accountId"
                  rules={{ required: "Selecting a trading account is required." }}
                  render={({ field }) => (
                    <Select
                      id="nte-accountId"
                      name={field.name}
                      value={field.value ?? ""}
                      onChange={(val) => {
                        if (val === "__new__") {
                          setAddingAccount(true);
                        } else {
                          field.onChange(val);
                        }
                      }}
                      onBlur={field.onBlur}
                      options={accountOptions}
                      placeholder="Select account"
                    />
                  )}
                />
              )}
              {errors.accountId && (
                <span className={errorStyles}>{errors.accountId.message}</span>
              )}
            </div>

            <div>
              <label className={labelStyles} htmlFor="nte-entryTime">Date</label>
              <input
                id="nte-entryTime"
                type="date"
                className={inputStyles}
                {...register("entryTime", { required: "Date is required" })}
              />
              {errors.entryTime && (
                <span className={errorStyles}>{errors.entryTime.message}</span>
              )}
            </div>
          </div>

          {/* Right: Notes + Images */}
          <div className="flex-1 min-w-0 border-t border-border lg:border-t-0 lg:border-l bg-surface-alt px-6 py-7 flex flex-col gap-6">
            <div className="flex-1 flex flex-col">
              <label className={labelStyles}>Notes</label>
              <TextEditor onChange={setNotes} />
            </div>
            <div>
              <label className={labelStyles}>Images</label>
              <ImageUpload onChange={setUploadedImages} maxImages={10} />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border">
          <button
            type="submit"
            className="w-full py-2.5 bg-accent text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={addEntryMutation.isPending}
          >
            {addEntryMutation.isPending ? "Submitting..." : "Log No Trade Day"}
          </button>
        </div>
      </form>

      {addingAccount && (
        <AccountModal
          onClose={() => setAddingAccount(false)}
          onSuccess={(acc) => setValue("accountId", acc._id)}
        />
      )}
    </div>
  );
};

export default NewNoTradeEntry;
