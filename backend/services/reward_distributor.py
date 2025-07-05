from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from models.sale import Sale  # ✅ changed from actual_sale
from models.salesman import Salesman
from models.incentive import Incentive
from models.leaderboardincentive import LeaderboardIncentive
from models.reward_log import RewardLog

def reward_top_salesman(db: Session, period: str):
    today = date.today()

    # Use current period's reference date
    reward_date = today
    if period == "week":
        reward_date = today - timedelta(days=today.weekday())  # Monday of current week
    elif period == "month":
        reward_date = today.replace(day=1)

    # Prevent duplicate rewards
    already = db.query(RewardLog).filter_by(period=period, date=reward_date).first()
    if already:
        return f"Already rewarded for {period} ({reward_date})"

    # Time filter
    if period == "day":
        sales_filter = func.date(Sale.timestamp) == today
    elif period == "week":
        sales_filter = extract("week", Sale.timestamp) == extract("week", func.now())
    elif period == "month":
        sales_filter = extract("month", Sale.timestamp) == extract("month", func.now())
    else:
        return "Invalid period"

    # Get top salesman
    top = (
        db.query(Sale.salesman_id, func.sum(Sale.amount).label("total"))
        .filter(sales_filter)
        .group_by(Sale.salesman_id)
        .order_by(func.sum(Sale.amount).desc())
        .first()
    )

    if not top:
        return f"No top performer found for {period}"

    salesman = db.query(Salesman).filter_by(id=top.salesman_id).first()
    if not salesman:
        return f"Salesman not found (ID: {top.salesman_id})"

    incentive_config = db.query(LeaderboardIncentive).first()
    if not incentive_config:
        return "Leaderboard incentive config missing"

    reward_amount = {
        "day": incentive_config.day_amount,
        "week": incentive_config.week_amount,
        "month": incentive_config.month_amount
    }.get(period, 0)

    if reward_amount <= 0:
        return f"No reward set for {period}"

    # Apply reward
    salesman.wallet_balance += reward_amount
    reward = Incentive(
        salesman_id=salesman.id,
        amount=reward_amount,
        type="leaderboard_reward",
        source=period
    )
    log = RewardLog(
        period=period,
        date=reward_date,
        salesman_id=salesman.id
    )

    db.add_all([reward, log])
    db.commit()
    return f"✅ ₹{reward_amount} given to {salesman.name} for {period} (sales: ₹{top.total})"
