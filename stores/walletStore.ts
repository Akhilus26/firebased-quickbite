import { create } from 'zustand';

type State = {
  balance: number;
};

type Actions = {
  addFunds: (amount: number) => void;
  spend: (amount: number) => boolean; // returns true if successful
  reset: () => void;
};

export const useWalletStore = create<State & Actions>((set, get) => ({
  balance: 0,
  addFunds(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    set((s) => ({ balance: s.balance + Math.floor(amount) }));
  },
  spend(amount) {
    const amt = Math.floor(amount);
    if (!Number.isFinite(amt) || amt <= 0) return false;
    const { balance } = get();
    if (balance < amt) return false;
    set({ balance: balance - amt });
    return true;
  },
  reset() { set({ balance: 0 }); },
}));
