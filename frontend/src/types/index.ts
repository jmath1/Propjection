export interface RentalUnit {
  id?: number;
  label: string;
  monthly_rent: number;
  owner_occupied_years: number;
  order: number;
}

export interface Projection {
  id?: number;
  property: number;
  name: string;
  purchase_year: number;
  analysis_horizon_years: number;
  sale_year: number;
  purchase_price: number;
  down_payment_pct: number;
  annual_appreciation_pct: number;
  transfer_tax_pct: number;
  lender_fees: number;
  title_insurance: number;
  inspection_appraisal: number;
  attorney_fees: number;
  other_closing_costs: number;
  interest_rate: number;
  term_years: number;
  pmi_rate: number;
  annual_rent_growth_pct: number;
  vacancy_rate_pct: number;
  property_mgmt_pct: number;
  property_tax_pct: number;
  insurance_annual: number;
  hoa_annual: number;
  maintenance_pct: number;
  utilities_annual: number;
  expense_inflation_pct: number;
  selling_costs_pct: number;
  scenario_appreciation_delta: number;
  scenario_rent_growth_delta: number;
  scenario_vacancy_delta: number;
  scenario_expense_inflation_delta: number;
  units?: RentalUnit[];
  created_at?: string;
  updated_at?: string;
}

export interface Property {
  id?: number;
  name: string;
  address?: string;
  property_type: string;
  notes?: string;
  projections?: Projection[];
  created_at?: string;
  updated_at?: string;
}

export interface ProjectionResults {
  derived: Record<string, any>;
  income_schedule: IncomeRow[];
  expense_schedule: ExpenseRow[];
  mortgage_schedule: MortgageRow[];
  equity_schedule: EquityRow[];
  cashflow_schedule: CashflowRow[];
  base_case: ScenarioAssumptions;
  scenarios: {
    bull: ScenarioAssumptions;
    base: ScenarioAssumptions;
    bear: ScenarioAssumptions;
  };
  verdict: Record<string, VerdictMetric>;
}

export interface IncomeRow {
  year_num: number;
  calendar_year: number;
  unit_rents: number[];
  total_monthly_rent: number;
  gross_annual_rent: number;
  vacancy_loss: number;
  property_mgmt_fee: number;
  effective_rental_income: number;
}

export interface ExpenseRow {
  year_num: number;
  calendar_year: number;
  property_tax: number;
  insurance: number;
  hoa: number;
  maintenance: number;
  utilities: number;
  total_operating: number;
  debt_service: number;
  all_in_cost: number;
}

export interface MortgageRow {
  year_num: number;
  calendar_year: number;
  beginning_balance: number;
  annual_payment: number;
  interest_paid: number;
  principal_paid: number;
  ending_balance: number;
  cumulative_interest: number;
  pmi: number;
}

export interface EquityRow {
  year_num: number;
  calendar_year: number;
  home_value: number;
  loan_balance: number;
  gross_equity: number;
  rental_income: number;
  operating_expenses: number;
  noi: number;
  cap_rate: number;
  annual_cash_flow: number;
  cumulative_cash_flow: number;
  net_proceeds_if_sold: number;
  total_return_if_sold: number;
}

export interface CashflowRow {
  year_num: number;
  calendar_year: number;
  effective_rental_income: number;
  operating_expenses: number;
  noi: number;
  debt_service: number;
  annual_cash_flow: number;
  monthly_cash_flow: number;
  dscr: number;
  cash_on_cash_return: number;
  cumulative_cash_flow: number;
}

export interface ScenarioAssumptions {
  appreciation: number;
  rent_growth: number;
  vacancy: number;
  expense_inflation: number;
}

export interface VerdictMetric {
  value: number | string;
  benchmark: number;
  pass: boolean;
  description: string;
}
