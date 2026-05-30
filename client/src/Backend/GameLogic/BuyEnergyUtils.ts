import { isLocatable } from '@dfares/gamelogic';
import { EthAddress, Planet } from '@dfares/types';
import bigInt from 'big-integer';
import { utils } from 'ethers';
import { ContractConstants } from '../../_types/darkforest/api/ContractsAPITypes';

export function planetCanBuyEnergy(
  planet: Planet | undefined,
  account: EthAddress | undefined
): boolean {
  return !!(
    planet &&
    account &&
    isLocatable(planet) &&
    planet.owner === account &&
    planet.planetLevel >= 3 &&
    planet.energyGrowth > 0 &&
    planet.energy > 0 &&
    planet.energy < planet.energyCap
  );
}

const GWEI = bigInt(1_000_000_000);

/**
 * Matches DFTradeFacet.buyEnergy:
 * fee = BUY_ENERGY_LEVEL_FEES[planetLevel] * durationSeconds * 1 gwei
 * if halfPrice: fee /= 2
 */
export function getBuyEnergyFeeWei(
  planetLevel: number,
  durationSeconds: number,
  contractConstants: ContractConstants,
  halfPrice: boolean
): string {
  if (durationSeconds <= 0 || !Number.isFinite(durationSeconds)) {
    return '0';
  }

  const baseFeePerSecond = contractConstants.BUY_ENERGY_LEVEL_FEES[planetLevel];
  let fee = bigInt(baseFeePerSecond).multiply(durationSeconds).multiply(GWEI);
  if (halfPrice) {
    fee = fee.divide(2);
  }
  return fee.toString();
}

export function formatBuyEnergyFeeEth(
  planetLevel: number,
  durationSeconds: number,
  contractConstants: ContractConstants,
  halfPrice: boolean
): string {
  return utils.formatEther(
    getBuyEnergyFeeWei(planetLevel, durationSeconds, contractConstants, halfPrice)
  );
}
