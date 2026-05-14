import { useForm } from "react-hook-form";
import { createTradeEntry } from "../api/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CreateTradeEntryData } from "../types/tradeEntry.types";
import { getAccounts } from "../api/api";
import { useState } from "react";
import AccountModal from "./AccountModal";
import {
  formInputStyles as inputStyles,
  formSelectStyles as selectStyles,
  formLabelStyles as labelStyles,
  formErrorStyles as errorStyles,
} from "../utils/styleConstants";
import LoadingSpinner from "./LoadingSpinner";
import ErrorState from "./ErrorState";
import ImageUpload from "./ImageUpload";
import TextEditor from "./TextEditor";

const NewEntry = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreateTradeEntryData>({ mode: "onTouched" });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [cancelConfirming, setCancelConfirming] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState("");

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

  const { onChange: rhfAccountOnChange, ...accountRest } = register("accountId", {
    required: "Selecting a trading account is required.",
  });

  return (
    <div className="px-8 py-10">
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-[800px] mx-auto bg-surface p-8 rounded-2xl border border-border grid grid-cols-2 gap-5"
    >
      {/* Header */}
      <div className="col-span-2 mb-2 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold text-ink-primary">Log New Trade</h2>
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
            New Account
          </button>
        ) : (
          <select
            className={selectStyles}
            {...accountRest}
            value={selectedAccountId}
            onChange={(e) => {
              if (e.target.value === "__new__") {
                setAddingAccount(true);
                setSelectedAccountId("");
                setValue("accountId", "", { shouldValidate: false });
              } else {
                setSelectedAccountId(e.target.value);
                rhfAccountOnChange(e);
              }
            }}
          >
            <option value="">Select a trading account</option>
            {accounts?.map((account) => (
              <option value={account._id} key={account._id}>{account.accountName}</option>
            ))}
            <option value="__new__">Add new account</option>
          </select>
        )}
        {errors.accountId && (
          <span className={errorStyles}>{errors.accountId.message}</span>
        )}
      </div>

      {addingAccount && (
        <AccountModal
          onClose={() => setAddingAccount(false)}
          onSuccess={(acc) => { setSelectedAccountId(acc._id); setValue("accountId", acc._id); }}
        />
      )}

      {/* Result */}
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

      {/* Contract */}
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

      {/* Direction */}
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

      {/* Contracts */}
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

      {/* Entry Price */}
      <div>
        <label className={labelStyles}>Entry Price</label>
        <input
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

      {/* Exit Price */}
      <div>
        <label className={labelStyles}>Exit Price</label>
        <input
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

      {/* Stop Loss */}
      <div>
        <label className={labelStyles}>Stop Loss</label>
        <input
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

      {/* Target */}
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

      {/* Entry Time */}
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

      {/* Exit Time */}
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

      {/* Notes */}
      <div className="col-span-2">
        <label className={labelStyles}>Notes</label>
        <TextEditor onChange={setNotes} />
      </div>

      {/* Images */}
      <div className="col-span-2">
        <label className={labelStyles}>Images</label>
        <ImageUpload onChange={setUploadedImages} maxImages={5} />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="col-span-2 w-full py-3 bg-accent text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors duration-150 hover:bg-accent-hover mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={addEntryMutation.isPending}
      >
        {addEntryMutation.isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
    </div>
  );
};

export default NewEntry;
