import { create } from 'zustand';

type State = { open: boolean };

type Actions = { setOpen: (open: boolean) => void };

export const useCanteenStore = create<State & Actions>((set) => ({
  open: true,
  setOpen: (open) => set({ open }),
}));
