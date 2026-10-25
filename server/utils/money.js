export const roundMoney = (amount) => {
  if (!Number.isFinite(amount)) {
    throw new TypeError("amount must be a finite number");
  }

  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

export const calculateMonthlyTax = (annualIncome) => {
  if (!Number.isFinite(annualIncome) || annualIncome < 0) {
    throw new TypeError("annualIncome must be a non-negative finite number");
  }

  let annualTax = 0;

  if (annualIncome > 3600000) {
    annualTax = 510000 + (annualIncome - 3600000) * 0.35;
  } else if (annualIncome > 2400000) {
    annualTax = 210000 + (annualIncome - 2400000) * 0.25;
  } else if (annualIncome > 1200000) {
    annualTax = 30000 + (annualIncome - 1200000) * 0.15;
  } else if (annualIncome > 600000) {
    annualTax = (annualIncome - 600000) * 0.05;
  }

  return roundMoney(annualTax / 12);
};

export const calculateGrossSalary = (basic) => {
  if (!Number.isFinite(basic) || basic <= 0) {
    throw new TypeError("basic must be a positive finite number");
  }

  return roundMoney(basic * 1.5);
};
