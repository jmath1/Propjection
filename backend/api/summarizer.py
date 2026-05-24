import os
from pydo import Client
from azure.core.exceptions import ResourceNotFoundError

def generate_deal_summary(projection, results: dict) -> str:
    """
    Generates a plain-English summary of a real estate deal using Claude Sonnet
    via DigitalOcean's Inference API.

    Requires DO_INFERENCE_MODEL_ACCESS_TOKEN env var and optionally DO_MODEL_NAME.
    """
    token = os.environ.get('DO_INFERENCE_MODEL_ACCESS_TOKEN')
    if not token:
        raise ValueError('DO_INFERENCE_MODEL_ACCESS_TOKEN environment variable must be set')

    client = Client(token=token)
    model_name = os.environ.get('DO_MODEL_NAME', 'gpt-4o')

    # Extract key metrics from results
    verdict = results.get('verdict', {})
    verdict_pass_count = sum(1 for m in verdict.values() if isinstance(m, dict) and m.get('pass'))
    verdict_total = sum(1 for m in verdict.values() if isinstance(m, dict))

    derived = results.get('derived', {})
    income_schedule = results.get('income_schedule', [])
    cashflow_schedule = results.get('cashflow_schedule', [])
    equity_schedule = results.get('equity_schedule', [])

    year_1_income = income_schedule[0] if income_schedule else {}
    year_1_cashflow = cashflow_schedule[0] if cashflow_schedule else {}
    year_3_cashflow = cashflow_schedule[2] if len(cashflow_schedule) > 2 else {}
    final_equity = equity_schedule[-1] if equity_schedule else {}

    # Helper to convert Decimal to float
    def to_float(val, default=0):
        if val is None:
            return default
        return float(val)

    # Extract and convert values
    purchase_price = to_float(derived.get('purchase_price'))
    down_payment = to_float(derived.get('down_payment'))
    loan_amount = to_float(derived.get('loan_amount'))
    gross_annual_rent = to_float(year_1_income.get('gross_annual_rent'))
    effective_rental_income = to_float(year_1_income.get('effective_rental_income'))
    debt_service = to_float(year_1_cashflow.get('debt_service'))
    annual_cash_flow = to_float(year_1_cashflow.get('annual_cash_flow'))
    dscr = to_float(year_1_cashflow.get('dscr'))
    year_3_cash_flow = to_float(year_3_cashflow.get('annual_cash_flow'))
    year_3_dscr = to_float(year_3_cashflow.get('dscr'))
    cumulative_cf = to_float(final_equity.get('cumulative_cash_flow'))
    home_value = to_float(final_equity.get('home_value'))

    prompt = f"""You are a real estate investment analyst. Provide a concise, plain-English summary of this deal in 2-3 sentences. Focus on whether it's a strong investment or has concerns and for what type of investor this would be better for and why. Be direct and objective.

Deal Information:
- Property: {projection.name or 'Unnamed'}
- Purchase Price: ${purchase_price:,.0f}
- Down Payment: ${down_payment:,.0f} ({to_float(projection.down_payment_pct)*100:.1f}%)
- Loan Amount: ${loan_amount:,.0f}

Year 1 Performance:
- Gross Annual Rent: ${gross_annual_rent:,.0f}
- NOI: ${effective_rental_income - debt_service:,.0f}
- Cash Flow: ${annual_cash_flow:,.0f}
- DSCR: {dscr:.2f}x
- Cap Rate: {effective_rental_income / max(purchase_price, 1) * 100:.2f}%

Year 3 Performance:
- Cash Flow: ${year_3_cash_flow:,.0f}
- DSCR: {year_3_dscr:.2f}x

30-Year Outlook:
- Cumulative Cash Flow: ${cumulative_cf:,.0f}
- Final Home Value: ${home_value:,.0f}

Deal Quality Metrics:
- Verdict Metrics Passing: {verdict_pass_count}/{verdict_total}

Short Term and Long Term Summary Estimates of numbers and what it would take

Provide your assessment in plain English."""

    try:
        resp = client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
        )
        return resp.choices[0].message.content
    except ResourceNotFoundError as e:
        raise ValueError(
            f"Model '{model_name}' not found in your DigitalOcean account. "
            f"Set DO_MODEL_NAME environment variable to one of your available models. "
            f"Error: {str(e)}"
        ) from e


def chat_with_deal(projection, results: dict, messages: list) -> str:
    """
    Chat with Claude about a real estate deal. Maintains conversation history.

    Args:
        projection: Projection model instance
        results: Calculated projection results dict
        messages: List of {role, content} dicts for the conversation

    Returns:
        The AI assistant's response
    """
    token = os.environ.get('DO_INFERENCE_MODEL_ACCESS_TOKEN')
    if not token:
        raise ValueError('DO_INFERENCE_MODEL_ACCESS_TOKEN environment variable must be set')

    client = Client(token=token)
    model_name = os.environ.get('DO_MODEL_NAME', 'gpt-4o')

    # Build deal context
    verdict = results.get('verdict', {})
    verdict_pass_count = sum(1 for m in verdict.values() if isinstance(m, dict) and m.get('pass'))
    verdict_total = sum(1 for m in verdict.values() if isinstance(m, dict))

    derived = results.get('derived', {})
    income_schedule = results.get('income_schedule', [])
    cashflow_schedule = results.get('cashflow_schedule', [])
    equity_schedule = results.get('equity_schedule', [])

    year_1_income = income_schedule[0] if income_schedule else {}
    year_1_cashflow = cashflow_schedule[0] if cashflow_schedule else {}
    year_3_cashflow = cashflow_schedule[2] if len(cashflow_schedule) > 2 else {}
    final_equity = equity_schedule[-1] if equity_schedule else {}

    def to_float(val, default=0):
        if val is None:
            return default
        return float(val)

    purchase_price = to_float(derived.get('purchase_price'))
    down_payment = to_float(derived.get('down_payment'))
    loan_amount = to_float(derived.get('loan_amount'))
    gross_annual_rent = to_float(year_1_income.get('gross_annual_rent'))
    effective_rental_income = to_float(year_1_income.get('effective_rental_income'))
    debt_service = to_float(year_1_cashflow.get('debt_service'))
    annual_cash_flow = to_float(year_1_cashflow.get('annual_cash_flow'))
    dscr = to_float(year_1_cashflow.get('dscr'))
    year_3_cash_flow = to_float(year_3_cashflow.get('annual_cash_flow'))
    year_3_dscr = to_float(year_3_cashflow.get('dscr'))
    cumulative_cf = to_float(final_equity.get('cumulative_cash_flow'))
    home_value = to_float(final_equity.get('home_value'))

    system_prompt = f"""You are a knowledgeable real estate investment analyst assistant. Help users understand their investment deal and how calculations are made.

When explaining metrics, be clear and use the specific numbers from this deal. When asked about calculations, explain both the formula and how it applies to this deal's numbers.

Here is the deal context:

Deal: {projection.name or 'Unnamed Property'}
Purchase Price: ${purchase_price:,.0f}
Down Payment: ${down_payment:,.0f} ({to_float(projection.down_payment_pct)*100:.1f}%)
Loan Amount: ${loan_amount:,.0f}

Year 1 Performance:
- Gross Annual Rent: ${gross_annual_rent:,.0f}
- NOI (Net Operating Income): ${effective_rental_income - debt_service:,.0f}
- Annual Cash Flow: ${annual_cash_flow:,.0f}
- DSCR (Debt Service Coverage Ratio): {dscr:.2f}x
- Cap Rate: {effective_rental_income / max(purchase_price, 1) * 100:.2f}%

Year 3 Projection:
- Cash Flow: ${year_3_cash_flow:,.0f}
- DSCR: {year_3_dscr:.2f}x

30-Year Outlook:
- Cumulative Cash Flow: ${cumulative_cf:,.0f}
- Final Property Value: ${home_value:,.0f}

Deal Quality: {verdict_pass_count}/{verdict_total} metrics passing

Be helpful, specific, and use the deal's actual numbers when explaining concepts."""

    try:
        chat_messages = [
            {"role": "system", "content": system_prompt},
            *messages
        ]
        resp = client.chat.completions.create(
            model=model_name,
            messages=chat_messages,
        )
        return resp.choices[0].message.content
    except ResourceNotFoundError as e:
        raise ValueError(
            f"Model '{model_name}' not found in your DigitalOcean account. "
            f"Set DO_MODEL_NAME environment variable to one of your available models. "
            f"Error: {str(e)}"
        ) from e
