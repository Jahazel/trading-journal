import { useForm, Controller } from "react-hook-form";
import { createTradeEntry } from "../api/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CreateTradeEntryData } from "../types/tradeEntry.types";
import { getAccounts } from "../api/api";
import { useState } from "react";
import AccountModal from "./AccountModal";
import Select from "./Select";
import {
  formInputStyles as inputStyles,
  formLabelStyles as labelStyles,
  formErrorStyles as errorStyles,
} from "../utils/styleConstants";
import LoadingSpinner from "./LoadingSpinner";
import ErrorState from "./ErrorState";
import ImageUpload from "./ImageUpload";
import TextEditor from "./TextEditor";

const SectionHeader = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-xs font-medium text-ink-muted tracking-[0.01em]">{label}</span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

const NewEntry = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<CreateTradeEntryData>({ mode: "onTouched" });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [cancelConfirming, setCancelConfirming] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>("");

  const addEntryMutation = useMutation({
    mutationFn: createTradeEntry,
    onSuccess: (data) => {
      if (!data?._id) {
        console.error("No ID returned from the server.");
        return;
      }
      queryClient.setQueryData(["entry", data._id], data);
      queryClient.invalidateQueries({ queryKey: ["allEntries"] });
      navigate(`/dashboard/trade-entries/${data._id}`);
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

  const handleCancel = () => {
    if (!isDirty && !notes) {
      navigate(-1);
      return;
    }
    setCancelConfirming(true);
  };

  const onSubmit = async (data: CreateTradeEntryData): Promise<void> => {
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
        className="max-w-5xl mx-auto bg-surface rounded-2xl border border-border overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-ink-primary">Log New Trade</h2>
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

          {/* Left: Trade Details */}
          <div className="flex-1 min-w-0 px-8 py-7 flex flex-col gap-7">

            {/* Session */}
            <div>
              <SectionHeader label="Session" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyles} htmlFor="accountId">Trading Account</label>
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
                          id="accountId"
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
                  <label className={labelStyles} htmlFor="result">Result</label>
                  <Controller
                    control={control}
                    name="result"
                    rules={{ required: "Selecting a result is required." }}
                    render={({ field }) => (
                      <Select
                        id="result"
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        options={[
                          { value: "Win", label: "Win" },
                          { value: "Loss", label: "Loss" },
                          { value: "Break Even", label: "Break Even" },
                        ]}
                        placeholder="Select result"
                      />
                    )}
                  />
                  {errors.result && (
                    <span className={errorStyles}>{errors.result.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Instrument */}
            <div>
              <SectionHeader label="Instrument" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelStyles} htmlFor="contract">Contract</label>
                  <Controller
                    control={control}
                    name="contract"
                    rules={{ required: "Selecting a contract type is required." }}
                    render={({ field }) => (
                      <Select
                        id="contract"
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        options={[
                          { value: "NQ", label: "NQ" },
                          { value: "MNQ", label: "MNQ" },
                          { value: "ES", label: "ES" },
                          { value: "MES", label: "MES" },
                        ]}
                        placeholder="Select"
                      />
                    )}
                  />
                  {errors.contract && (
                    <span className={errorStyles}>{errors.contract.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelStyles} htmlFor="direction">Direction</label>
                  <Controller
                    control={control}
                    name="direction"
                    rules={{ required: "Selecting a direction is required." }}
                    render={({ field }) => (
                      <Select
                        id="direction"
                        name={field.name}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        options={[
                          { value: "Long", label: "Long" },
                          { value: "Short", label: "Short" },
                        ]}
                        placeholder="Select"
                      />
                    )}
                  />
                  {errors.direction && (
                    <span className={errorStyles}>{errors.direction.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelStyles} htmlFor="contracts">Contracts</label>
                  <input
                    id="contracts"
                    type="number"
                    step="1"
                    min="1"
                    className={inputStyles}
                    {...register("contracts", {
                      required: "The number of contracts is required.",
                      min: { value: 1, message: "Contracts must be at least 1" },
                      valueAsNumber: true,
                    })}
                  />
                  {errors.contracts && (
                    <span className={errorStyles}>{errors.contracts.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Price Levels */}
            <div>
              <SectionHeader label="Price Levels" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyles} htmlFor="entryPrice">Entry Price</label>
                  <input
                    id="entryPrice"
                    type="number"
                    step="0.01"
                    className={inputStyles}
                    {...register("entryPrice", {
                      required: "Entry price is required",
                      min: { value: 4000, message: "Entry price must be greater than 4,000." },
                      max: { value: 50000, message: "Entry price must be less than 50,000." },
                      valueAsNumber: true,
                    })}
                  />
                  {errors.entryPrice && (
                    <span className={errorStyles}>{errors.entryPrice.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelStyles} htmlFor="exitPrice">Exit Price</label>
                  <input
                    id="exitPrice"
                    type="number"
                    step="0.01"
                    className={inputStyles}
                    {...register("exitPrice", {
                      required: "Exit price is required",
                      min: { value: 4000, message: "Exit price must be greater than 4,000." },
                      max: { value: 50000, message: "Exit price must be less than 50,000." },
                      valueAsNumber: true,
                    })}
                  />
                  {errors.exitPrice && (
                    <span className={errorStyles}>{errors.exitPrice.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelStyles} htmlFor="stopLoss">Stop Loss</label>
                  <input
                    id="stopLoss"
                    type="number"
                    step="0.01"
                    className={inputStyles}
                    {...register("stopLoss", {
                      required: "Stop loss is required",
                      min: { value: 4000, message: "Stop loss must be greater than 4,000." },
                      max: { value: 50000, message: "Stop loss must be less than 50,000." },
                      valueAsNumber: true,
                    })}
                  />
                  {errors.stopLoss && (
                    <span className={errorStyles}>{errors.stopLoss.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelStyles} htmlFor="target">Target</label>
                  <input
                    id="target"
                    type="number"
                    step="0.01"
                    className={inputStyles}
                    {...register("target", {
                      required: "Target is required",
                      min: { value: 4000, message: "Target must be greater than 4,000." },
                      max: { value: 50000, message: "Target must be less than 50,000." },
                      valueAsNumber: true,
                    })}
                  />
                  {errors.target && (
                    <span className={errorStyles}>{errors.target.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Timing */}
            <div>
              <SectionHeader label="Timing" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyles} htmlFor="entryTime">Entry Time</label>
                  <input
                    id="entryTime"
                    type="datetime-local"
                    className={inputStyles}
                    {...register("entryTime", { required: "Entry time is required" })}
                  />
                  {errors.entryTime && (
                    <span className={errorStyles}>{errors.entryTime.message}</span>
                  )}
                </div>

                <div>
                  <label className={labelStyles} htmlFor="exitTime">Exit Time</label>
                  <input
                    id="exitTime"
                    type="datetime-local"
                    className={inputStyles}
                    {...register("exitTime", { required: "Exit time is required" })}
                  />
                  {errors.exitTime && (
                    <span className={errorStyles}>{errors.exitTime.message}</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right: Notes Panel */}
          <div className="lg:w-[400px] shrink-0 border-t border-border lg:border-t-0 lg:border-l bg-surface-alt px-6 py-7 flex flex-col gap-6">
            <div className="flex-1 flex flex-col">
              <label className={labelStyles}>Notes</label>
              <TextEditor onChange={setNotes} />
            </div>
            <div>
              <label className={labelStyles}>Images</label>
              <ImageUpload onChange={setUploadedImages} maxImages={5} />
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
            {addEntryMutation.isPending ? "Submitting..." : "Log Trade"}
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

export default NewEntry;
