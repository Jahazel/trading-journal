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

  const inputStyles =
    "w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 font-inherit";
  const labelStyles = "block text-sm font-medium text-gray-600 mb-1.5";
  const errorStyles = "block text-xs text-red-500 mt-1";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-[800px] mx-auto bg-white p-8 rounded-2xl border border-gray-200 grid grid-cols-1 gap-5"
    >
      <div className="mb-2 pb-4 border-b-2 border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Log No Trade Day
        </h2>
        <p className="text-sm text-gray-500">
          Record a day you chose not to trade
        </p>
      </div>
      <div>
        <label className={labelStyles}>Date</label>
        <input
          type="datetime-local"
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
      {addEntryMutation.error && (
        <span className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {addEntryMutation.error.message}
        </span>
      )}
      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white rounded-lg text-base font-semibold cursor-pointer transition-colors hover:bg-blue-700 mt-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        disabled={addEntryMutation.isPending}
      >
        {addEntryMutation.isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default NewNoTradeEntry;
