import type { GameMode } from './game';
/** Single reward rule shared by the game result and the profile settlement. */
export function calculateMissionReward(killCoins:number, completed:boolean, mode:GameMode, level:number):number {
  const base=Math.max(0,Math.floor(Number.isFinite(killCoins)?killCoins:0));
  const completionBonus=completed ? 8+Math.min(30,Math.max(1,level))*2 : 0;
  const modeBonus=completed ? (mode==='Survival'?12:mode==='Rescue'?10:mode==='Sabotage'?10:0) : 0;
  return completed ? base+completionBonus+modeBonus : Math.max(3,Math.floor(base*0.35));
}
