import { Projection } from '../types';

export const PERCENTAGE_FIELDS = [
  'down_payment_pct',
  'annual_appreciation_pct',
  'interest_rate',
  'pmi_rate',
  'refinance_rate',
  'annual_rent_growth_pct',
  'vacancy_rate_pct',
  'property_mgmt_pct',
  'property_tax_pct',
  'maintenance_pct',
  'expense_inflation_pct',
  'selling_costs_pct',
  'transfer_tax_pct',
  'scenario_appreciation_delta',
  'scenario_rent_growth_delta',
  'scenario_vacancy_delta',
  'scenario_expense_inflation_delta',
];

export function toDisplayPct(data: Partial<Projection>): Partial<Projection> {
  const converted = { ...data };
  PERCENTAGE_FIELDS.forEach(field => {
    const value = (converted as any)[field];
    if (value != null && value > 0 && value < 1) {
      (converted as any)[field] = value * 100;
    }
  });
  return converted;
}

export function toDecimalPct(data: Partial<Projection>): Partial<Projection> {
  const converted = { ...data };
  PERCENTAGE_FIELDS.forEach(field => {
    const value = (converted as any)[field];
    if (field in converted && value != null && value !== 0) {
      (converted as any)[field] = value / 100;
    }
  });
  return converted;
}
