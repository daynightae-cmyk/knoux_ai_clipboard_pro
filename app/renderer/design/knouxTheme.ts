/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DESIGN_TOKENS } from "./designTokens";

export const KNOUX_THEME = {
  tokens: DESIGN_TOKENS,
  classes: {
    glass: "bg-white/75 backdrop-blur-md border border-knoux-purple/10 shadow-knoux-glow rounded-3xl",
    glassLavender: "bg-[#F7F2FF]/75 backdrop-blur-md border border-knoux-purple/10 shadow-knoux-glow rounded-3xl",
    cardHover: "knoux-card-hover transition-all duration-300 hover:scale-[1.008] hover:-translate-y-0.5 hover:shadow-knoux-glow hover:border-knoux-purple/20",
    buttonPrimary: "px-5 py-2.5 rounded-xl bg-gradient-to-r from-knoux-purple to-knoux-neon text-white text-xs font-semibold shadow-knoux-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer",
    buttonSecondary: "px-5 py-2.5 rounded-xl border border-knoux-purple/20 bg-white hover:bg-knoux-purple/5 text-knoux-purple text-xs font-semibold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer",
    badgeActive: "bg-knoux-purple/10 text-knoux-purple border border-knoux-purple/10 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
    badgeMuted: "bg-[#FCFAFF] text-knoux-muted-text border border-knoux-purple/5 text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider",
  }
};
