import { useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAccount } from "../api/api";
import { queryKeys } from "../api/queryKeys";
import { Account, CreateAccountData } from "../types/account.types";
import {
  formInputStyles as inputStyles,
  formLabelStyles as labelStyles,
  formErrorStyles as errorStyles,
} from "../utils/styleConstants";
import Select from "./Select";

interface AccountModalProps {
  onClose: () => void;
  onSuccess?: (account: Account) => void;
}

const AccountModal = ({ onClose, onSuccess }: AccountModalProps) => {
  const { register, control, handleSubmit, formState: { errors } } = useForm<CreateAccountData>({ mode: "onTouched" });
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: createAccount,
    onSuccess: async (account) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      onSuccess?.(account);
      onClose();
    },
  });

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, input, select, [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    modal.addEventListener("keydown", handleKeyDown);
    return () => modal.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,34,53,0.4)]"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        className="bg-surface rounded-xl shadow-modal w-full max-w-md mx-4 p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="account-modal-title" className="text-lg font-semibold text-ink-primary">
          New Account
        </h2>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelStyles}>Account Name</label>
              <input
                type="text"
                placeholder="e.g. Main Funded Account"
                className={inputStyles}
                {...register("accountName", { required: "Account name is required." })}
              />
              {errors.accountName && <span className={errorStyles}>{errors.accountName.message}</span>}
            </div>

            <div>
              <label className={labelStyles}>Starting Balance</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="50000"
                className={inputStyles}
                {...register("startingBalance", {
                  required: "Starting balance is required.",
                  min: { value: 0, message: "Balance must be 0 or greater." },
                  valueAsNumber: true,
                })}
              />
              {errors.startingBalance && <span className={errorStyles}>{errors.startingBalance.message}</span>}
            </div>

            <div>
              <label className={labelStyles}>Account Type</label>
              <Controller
                name="type"
                control={control}
                rules={{ required: "Account type is required." }}
                render={({ field }) => (
                  <Select
                    id="modal-account-type"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Select a type"
                    options={[
                      { value: "personal", label: "Personal" },
                      { value: "funded", label: "Funded" },
                    ]}
                  />
                )}
              />
              {errors.type && <span className={errorStyles}>{errors.type.message}</span>}
            </div>
          </div>

          {mutation.error && (
            <p className="text-sm text-ink-secondary bg-surface-alt border border-border rounded-md px-3 py-2">
              {mutation.error.message}
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-ink-secondary border border-border rounded-lg cursor-pointer transition-colors duration-150 hover:bg-surface-alt"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => mutation.mutate(data))}
              disabled={mutation.isPending}
              className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? "Creating…" : "Create account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
