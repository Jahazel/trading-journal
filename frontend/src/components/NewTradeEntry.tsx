import { useForm } from "react-hook-form";
import { createTradeEntry } from "../api/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CreateTradeEntryData } from "../types/tradeEntry.types";
import { getAccounts } from "@/api/api";

const NewEntry = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTradeEntryData>({ mode: "onTouched" });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  if (isLoading)
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500">Loading account details...</p>
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

  const onSubmit = async (data: CreateTradeEntryData): Promise<void> => {
    addEntryMutation.mutate(data);
  };

  const inputStyles =
    "w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 font-inherit";
  const selectStyles = `${inputStyles} cursor-pointer`;
  const labelStyles = "block text-sm font-medium text-gray-600 mb-1.5";
  const errorStyles = "block text-xs text-red-500 mt-1";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-[800px] mx-auto bg-white p-8 rounded-2xl border border-gray-200 grid grid-cols-2 gap-5"
    >
      <div className="col-span-2 mb-2 pb-4 border-b-2 border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Log New Trade</h2>
        <p className="text-sm text-gray-500">Enter your trade details below</p>
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
      {addEntryMutation.error && (
        <span className="col-span-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {addEntryMutation.error.message}
        </span>
      )}
      <button
        type="submit"
        className="col-span-2 w-full py-3 bg-blue-600 text-white rounded-lg text-base font-semibold cursor-pointer transition-colors hover:bg-blue-700 mt-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        disabled={addEntryMutation.isPending}
      >
        {addEntryMutation.isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default NewEntry;
