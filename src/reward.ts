import type { GameMode } from './game';
/** Single reward rule shared by the game result and the profile settlement. */
export function calculateMissionReward(killCoins:number, completed:boolean, mode:GameMode, level:number):number {
  const base=Math.max(0,Math.floor(Number.isFinite(killCoins)?killCoins:0));
  // Campaign level completion is a fixed, predictable payout; kill coins are not added again.
  if (completed) return 300;
  return Math.max(3,Math.floor(base*0.35));
}
