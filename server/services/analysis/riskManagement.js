class RiskManagement {
  static calculateTradeLevels(direction, ltp, atr, swingHigh, swingLow, customSlPoints = 15) {
    if (!ltp) return null;

    const slGap = customSlPoints || 15;
    const lotSize = 2; // Default 2 Lots (50 Qty)

    const entryMin = Math.round((ltp - 5) * 100) / 100;
    const entryMax = Math.round((ltp + 5) * 100) / 100;
    const entryMid = Math.round(ltp * 100) / 100;

    if (direction === 'LONG') {
      const stopLoss = Math.round((entryMid - slGap) * 100) / 100;
      const target1 = Math.round((entryMid + slGap * 2.0) * 100) / 100;
      const target2 = Math.round((entryMid + slGap * 4.0) * 100) / 100;
      const target3 = Math.round((entryMid + slGap * 6.0) * 100) / 100;

      return {
        entryMin,
        entryMax,
        entryMid,
        stopLoss,
        target1,
        target2,
        target3,
        riskPoints: slGap,
        rewardPointsT1: Math.round((target1 - entryMid) * 100) / 100,
        rewardPointsT2: Math.round((target2 - entryMid) * 100) / 100,
        riskReward: '1:2.4',
        lotSize
      };
    } else if (direction === 'SHORT') {
      const stopLoss = Math.round((entryMid + slGap) * 100) / 100;
      const target1 = Math.round((entryMid - slGap * 2.0) * 100) / 100;
      const target2 = Math.round((entryMid - slGap * 4.0) * 100) / 100;
      const target3 = Math.round((entryMid - slGap * 6.0) * 100) / 100;

      return {
        entryMin,
        entryMax,
        entryMid,
        stopLoss,
        target1,
        target2,
        target3,
        riskPoints: slGap,
        rewardPointsT1: Math.round((entryMid - target1) * 100) / 100,
        rewardPointsT2: Math.round((entryMid - target2) * 100) / 100,
        riskReward: '1:2.4',
        lotSize
      };
    }

    return null;
  }

  static calculatePositionSize(capital = 100000, riskPercent = 1.0, riskPoints = 15) {
    const maxRiskRupees = Math.round(capital * (riskPercent / 100));
    const contractLotSize = 25; // NIFTY Lot Size = 25

    if (!riskPoints || riskPoints <= 0) {
      return { maxRiskRupees, suggestedQuantity: 50, lots: 2 };
    }

    const maxQtyByRisk = Math.floor(maxRiskRupees / riskPoints);
    const lots = Math.max(1, Math.floor(maxQtyByRisk / contractLotSize));
    const suggestedQuantity = lots * contractLotSize;

    return {
      maxRiskRupees,
      suggestedQuantity,
      lots,
      lotSize: contractLotSize
    };
  }
}

module.exports = RiskManagement;
