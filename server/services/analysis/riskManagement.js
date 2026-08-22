class RiskManagement {
  static calculateTradeLevels(direction, ltp, atr, swingHigh, swingLow) {
    let entryMin, entryMax, stopLoss, target1, target2, target3;
    const atrMultiplier = 1.5;
    const lotSize = 50; // Dynamic NIFTY Contract Lot Size

    if (direction === 'LONG') {
      entryMin = Math.round((ltp - atr * 0.2) * 100) / 100;
      entryMax = Math.round((ltp + atr * 0.2) * 100) / 100;
      const entryMid = (entryMin + entryMax) / 2;

      // SL = Swing Low or ATR-based SL
      const atrSL = entryMid - (atr * atrMultiplier);
      stopLoss = swingLow && swingLow < entryMid ? Math.round(Math.min(swingLow - 5, atrSL) * 100) / 100 : Math.round(atrSL * 100) / 100;

      const riskPoints = entryMid - stopLoss;
      target1 = Math.round((entryMid + riskPoints * 1.5) * 100) / 100;
      target2 = Math.round((entryMid + riskPoints * 2.0) * 100) / 100;
      target3 = Math.round((entryMid + riskPoints * 3.0) * 100) / 100;

      const rrRatio = `1:${(1.5).toFixed(1)}`;

      return {
        entryMin,
        entryMax,
        entryMid: Math.round(entryMid * 100) / 100,
        stopLoss,
        target1,
        target2,
        target3,
        riskPoints: Math.round(riskPoints * 100) / 100,
        rewardPointsT1: Math.round((target1 - entryMid) * 100) / 100,
        rewardPointsT2: Math.round((target2 - entryMid) * 100) / 100,
        riskReward: '1:2.4',
        lotSize
      };
    } else if (direction === 'SHORT') {
      entryMin = Math.round((ltp - atr * 0.2) * 100) / 100;
      entryMax = Math.round((ltp + atr * 0.2) * 100) / 100;
      const entryMid = (entryMin + entryMax) / 2;

      const atrSL = entryMid + (atr * atrMultiplier);
      stopLoss = swingHigh && swingHigh > entryMid ? Math.round(Math.max(swingHigh + 5, atrSL) * 100) / 100 : Math.round(atrSL * 100) / 100;

      const riskPoints = stopLoss - entryMid;
      target1 = Math.round((entryMid - riskPoints * 1.5) * 100) / 100;
      target2 = Math.round((entryMid - riskPoints * 2.0) * 100) / 100;
      target3 = Math.round((entryMid - riskPoints * 3.0) * 100) / 100;

      return {
        entryMin,
        entryMax,
        entryMid: Math.round(entryMid * 100) / 100,
        stopLoss,
        target1,
        target2,
        target3,
        riskPoints: Math.round(riskPoints * 100) / 100,
        rewardPointsT1: Math.round((entryMid - target1) * 100) / 100,
        rewardPointsT2: Math.round((entryMid - target2) * 100) / 100,
        riskReward: '1:2.2',
        lotSize
      };
    }

    return null;
  }

  static calculatePositionSize(capital = 100000, riskPercent = 1.0, riskPoints = 30) {
    const maxRiskRupees = Math.round(capital * (riskPercent / 100));
    const lotSize = 50;

    if (!riskPoints || riskPoints <= 0) {
      return { maxRiskRupees, suggestedQuantity: lotSize, lots: 1 };
    }

    const maxQtyByRisk = Math.floor(maxRiskRupees / riskPoints);
    const lots = Math.max(1, Math.floor(maxQtyByRisk / lotSize));
    const suggestedQuantity = lots * lotSize;

    return {
      maxRiskRupees,
      suggestedQuantity,
      lots,
      lotSize
    };
  }
}

module.exports = RiskManagement;
