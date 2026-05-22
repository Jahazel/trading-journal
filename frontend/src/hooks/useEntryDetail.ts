import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { queryKeys } from "../api/queryKeys";

interface UseEntryDetailParams<TEntry> {
  id: string;
  queryKey: readonly unknown[];
  queryFn: () => Promise<TEntry>;
  updateFn: (payload: { id: string; [key: string]: unknown }) => Promise<TEntry>;
  deleteFn: (id: string) => Promise<unknown>;
}

export function useEntryDetail<TEntry>({
  id,
  queryKey,
  queryFn,
  updateFn,
  deleteFn,
}: UseEntryDetailParams<TEntry>) {
  const [activeField, setActiveField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string | number>("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    };
  }, []);

  const { data: entry, isLoading, error } = useQuery<TEntry>({
    queryKey,
    queryFn,
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: updateFn,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.allEntries() });
      setSaveStatus("saved");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => {
      setSaveStatus("error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allEntries() });
      navigate("/dashboard");
    },
    onError: () => {
      setDeleteConfirming(false);
      setDeleteError("Could not delete. Try again.");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setDeleteError(null), 4000);
    },
  });

  const handleSave = (value: string | number = tempValue, field: string | null = activeField): void => {
    if (field) {
      updateMutation.mutate({ id, [field]: value });
      setActiveField(null);
      setTempValue("");
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirming(true);
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    deleteTimerRef.current = setTimeout(() => setDeleteConfirming(false), 4000);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirming(false);
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
  };

  const handleDeleteConfirm = () => {
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    deleteMutation.mutate();
  };

  const activate = (field: string, value: string | number) => {
    setActiveField(field);
    setTempValue(value);
  };

  const sharedInputProps = {
    onBlur: () => handleSave(),
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSave();
      if (e.key === "Escape") {
        setActiveField(null);
        setTempValue("");
      }
    },
    autoFocus: true as const,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      setTempValue(e.target.value);
    },
    value: tempValue,
  };

  return {
    entry,
    isLoading,
    error,
    saveStatus,
    deleteConfirming,
    deleteError,
    handleSave,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    activate,
    activeField,
    tempValue,
    sharedInputProps,
    deleteMutation,
    updateMutation,
  };
}
