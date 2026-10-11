import { create } from "zustand";

type InquiryState = {
  /** cake style chosen in the cakes section, prefilled into the inquiry form */
  style: string;
  setStyle: (s: string) => void;
  /** price direction (no numbers on purpose): chosen in the pricing section */
  tier: string;
  setTier: (t: string) => void;
};

export const useInquiry = create<InquiryState>((set) => ({
  style: "",
  setStyle: (style) => set({ style }),
  tier: "",
  setTier: (tier) => set({ tier }),
}));
