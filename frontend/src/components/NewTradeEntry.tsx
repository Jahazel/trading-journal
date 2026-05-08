import { useForm } from "react-hook-form";
import { createTradeEntry } from "../api/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CreateTradeEntryData } from "../types/tradeEntry.types";
import { getAccounts } from "../api/api";
import { useState } from "react";
import {
  formInputStyles as inputStyles,
  formSelectStyles as selectStyles,
  formLabelStyles as labelStyles,
  formErrorStyles as errorStyles,
} from "../utils/styleConstants";
import LoadingSpinner from "./LoadingSpinner";
import ErrorState from "./ErrorState";
import ImageUpload from "./ImageUpload";

const NewEntry = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateTradeEntryData>({ mode: "onTouched" });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [cancelConfirming, setCancelConfirming] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

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
    if (!isDirty) {
      navigate(-1);
      return;
    }
    setCancelConfirming(true);
  };

  const onSubmit = async (data: CreateTradeEntryData): Promise<void> => {
    addEntryMutation.mutate({ ...data, images: uploadedImages });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-[800px] mx-auto bg-surface p-8 rounded-2xl border border-border grid grid-cols-2 gap-5"
    >
      <div className="col-span-2 mb-2 pb-4 border-b-2 border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink-primary mb-1">Log New Trade</h2>
            <p className="text-sm text-ink-secondary">Enter your trade details below</p>
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
        <label className={labelStyles}>Result</label>
        <select
          className={selectStyles}
          {...register("result", {
            required: "Selecting a result is required.",
          })}
        >
          <option value="">Select a result</option>
          <option value="Win">Win</option>
          <option value="Loss">Loss</option>
          <option value="Break Even">Break Even</option>
        </select>
        {errors.result && (
          <span className={errorStyles}>{errors.result.message}</span>
        )}
      </div>
      <div>
        <label className={labelStyles}>Contract</label>
        <select
          className={selectStyles}
          {...register("contract", {
            required: "Selecting a contract type is required.",
          })}
        >
          <option value="">Select a contract</option>
          <option value="NQ">NQ</option>
          <option value="MNQ">MNQ</option>
          <option value="ES">ES</option>
          <option value="MES">MES</option>
        </select>
        {errors.contract && (
          <span className={errorStyles}>{errors.contract.message}</span>
        )}
      </div>
      <div>
        <label className={labelStyles}>Direction</label>
        <select
          className={selectStyles}
          {...register("direction", {
            required: "Selecting a direction is required.",
          })}
        >
          <option value="">Select a direction</option>
          <option value="Long">Long</option>
          <option value="Short">Short</option>
        </select>
        {errors.direction && (
          <span className={errorStyles}>{errors.direction.message}</span>
        )}
      </div>
      <div>
        <label className={labelStyles}>Number of Contracts</label>
        <input
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
      <div>
        <label className={labelStyles}>Entry Price</label>
        <input
          type="number"
          step="0.01"
          className={inputStyles}
          {...register("entryPrice", {
            required: "Entry price is required",
            min: {
              value: 4000,
              message: "Entry price must be greater than 4,000.",
            },
            max: {
              value: 50000,
              message: "Entry price must be less than 50,000.",
            },
            valueAsNumber: true,
          })}
        />
        {errors.entryPrice && (
          <span className={errorStyles}>{errors.entryPrice.message}</span>
        )}
      </div>
      <div>
        <label className={labelStyles}>Exit Price</label>
        <input
          type="number"
          step="0.01"
          className={inputStyles}
          {...register("exitPrice", {
            required: "Exit price is required",
            min: {
              value: 4000,
              message: "Exit price must be greater than 4,000.",
            },
            max: {
              value: 50000,
              message: "Exit price must be less than 50,000.",
            },
            valueAsNumber: true,
          })}
        />
        {errors.exitPrice && (
          <span className={errorStyles}>{errors.exitPrice.message}</span>
        )}
      </div>
      <div>
        <label className={labelStyles}>Stop Loss</label>
        <input
          type="number"
          step="0.01"
          className={inputStyles}
          {...register("stopLoss", {
            required: "Stop loss is required",
            min: {
              value: 4000,
              message: "Stop loss must be greater than 4,000.",
            },
            max: {
              value: 50000,
              message: "Stop loss must be less than 50,000.",
            },
            valueAsNumber: true,
          })}
        />
        {errors.stopLoss && (
          <span className={errorStyles}>{errors.stopLoss.message}</span>
        )}
      </div>
      <div>
        <label className={labelStyles}>Target</label>
        <input
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
      <div>
        <label className={labelStyles}>Entry Time</label>
        <input
          type="datetime-local"
          className={inputStyles}
          {...register("entryTime", { required: "Entry time is required" })}
        />
        {errors.entryTime && (
          <span className={errorStyles}>{errors.entryTime.message}</span>
        )}
      </div>
      <div>
        <label className={labelStyles}>Exit Time</label>
        <input
          type="datetime-local"
          className={inputStyles}
          {...register("exitTime", { required: "Exit time is required" })}
        />
        {errors.exitTime && (
          <span className={errorStyles}>{errors.exitTime.message}</span>
        )}
      </div>
      <div className="col-span-2">
        <label className={labelStyles}>Notes</label>
        <textarea
          className={`${inputStyles} resize-none min-h-[100px]`}
          placeholder="Add any notes about this trade..."
          {...register("notes")}
        />
      </div>
      <div className="col-span-2">
        <label className={labelStyles}>Images</label>
        <ImageUpload onChange={setUploadedImages} maxImages={5} />
      </div>
      <button
        type="submit"
        className="col-span-2 w-full py-3 bg-sage text-surface rounded-lg text-base font-semibold cursor-pointer transition-colors hover:bg-sage-hover mt-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        disabled={addEntryMutation.isPending}
      >
        {addEntryMutation.isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default NewEntry;
