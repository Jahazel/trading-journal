import { useForm } from "react-hook-form";
import { createNoTradeEntry } from "../api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import TextEditor from "./TextEditor.js";
import { useState } from "react";
import { CreateNoTradeEntryData } from "../types/noTradeEntry.types";

const NewNoTradeEntry = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateNoTradeEntryData>({ mode: "onTouched" });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<string>("");

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

  const onSubmit = async (data: CreateNoTradeEntryData) => {
    addEntryMutation.mutate({ ...data, notes });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="trade-form no-trade-form"
    >
      <div className="form-header">
        <h2>Log No Trade Day</h2>
        <p>Record a day you chose not to trade</p>
      </div>
      <div className="form-group">
        <label>Date</label>
        <input
          type="datetime-local"
          {...register("date", { required: "Date is required" })}
        />
        {errors.date && <span>{errors.date.message}</span>}
      </div>
      <div className="form-group">
        <label>Notes</label>
        <TextEditor onChange={setNotes} />
      </div>
      {addEntryMutation.error && (
        <span className="error-msg">{addEntryMutation.error.message}</span>
      )}
      <button
        type="submit"
        className="submit-entry-btn"
        disabled={addEntryMutation.isPending}
      >
        {addEntryMutation.isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default NewNoTradeEntry;
