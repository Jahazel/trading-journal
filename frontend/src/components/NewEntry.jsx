import { useForm } from "react-hook-form";
import { createEntry } from "../api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const NewEntry = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onTouched" });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const addEntryMutation = useMutation({
    mutationFn: createEntry,
    onSuccess: (data) => {
      if (!data?._id) {
        console.error("No ID returned from the server.");
        return;
      }

      queryClient.setQueryData(["entry", data._id], data);
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      navigate(`/dashboard/trades/${data._id}`);
      reset();
    },
    onError: (error) => {
      console.error("Failed to create trade entry:", error);
    },
  });

  const onSubmit = async (data) => {
    addEntryMutation.mutate(data);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="trade-form">
        <div className="form-header">
          <h2>Log New Trade</h2>
          <p>Enter your trade details below</p>
        </div>

        <div className="form-group">
          <label>Contract</label>
          <select
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
          {errors.contract && <span>{errors.contract.message}</span>}
        </div>

        <div className="form-group">
          <label>Direction</label>
          <select
            {...register("direction", {
              required: "Selecting a direction is required.",
            })}
          >
            <option value="">Select a direction</option>
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>
          {errors.direction && <span>{errors.direction.message}</span>}
        </div>

        <div className="form-group">
          <label>Number of Contracts</label>
          <input
            type="number"
            step="1"
            min="1"
            {...register("contracts", {
              required: "The number of contracts is required.",
              min: { value: 1, message: "Contracts must be at least 1" },
              valueAsNumber: true,
            })}
          />
          {errors.contracts && <span>{errors.contracts.message}</span>}
        </div>

        <div className="form-group">
          <label>Entry Price</label>
          <input
            type="number"
            step="0.01"
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
          {errors.entryPrice && <span>{errors.entryPrice.message}</span>}
        </div>

        <div className="form-group">
          <label>Exit Price</label>
          <input
            type="number"
            step="0.01"
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
          {errors.exitPrice && <span>{errors.exitPrice.message}</span>}
        </div>

        <div className="form-group">
          <label>Stop Loss</label>
          <input
            type="number"
            step="0.01"
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
          {errors.stopLoss && <span>{errors.stopLoss.message}</span>}
        </div>

        <div className="form-group">
          <label>Target</label>
          <input
            type="number"
            step="0.01"
            {...register("target", {
              required: "Target is required",
              min: {
                value: 4000,
                message: "Target must be greater than 4,000.",
              },
              max: {
                value: 50000,
                message: "Target must be less than 50,000.",
              },
              valueAsNumber: true,
            })}
          />
          {errors.target && <span>{errors.target.message}</span>}
        </div>

        <div className="form-group">
          <label>Entry Time</label>
          <input
            type="datetime-local"
            {...register("entryTime", {
              required: "Entry time is required",
            })}
          />
          {errors.entryTime && <span>{errors.entryTime.message}</span>}
        </div>

        <div className="form-group">
          <label>Exit Time</label>
          <input
            type="datetime-local"
            {...register("exitTime", {
              required: "Exit time is required",
            })}
          />
          {errors.exitTime && <span>{errors.exitTime.message}</span>}
        </div>

        <div className="form-group">
          <label>Setup</label>
          <input type="text" {...register("setup")} />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea {...register("notes")} rows="4" />
        </div>

        {addEntryMutation.error && (
          <span>{addEntryMutation.error.message}</span>
        )}

        <button
          type="submit"
          className="submit-entry-btn"
          disabled={addEntryMutation.isPending}
        >
          {addEntryMutation.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </>
  );
};

export default NewEntry;
