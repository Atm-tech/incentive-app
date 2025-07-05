from datetime import date, timedelta

def get_month_range(today: date):
    start = today.replace(day=1)
    if today.month == 12:
        end = today.replace(day=31)
    else:
        next_month = today.replace(day=28) + timedelta(days=4)  # always gets next month
        end = next_month.replace(day=1) - timedelta(days=1)
    label = today.strftime("%B")
    return start, end, label

def get_week_range_and_label(today: date):
    start = today - timedelta(days=today.weekday())  # Monday
    end = start + timedelta(days=6)                  # Sunday

    first_day = today.replace(day=1)
    first_monday = first_day + timedelta(days=(0 - first_day.weekday()) % 7)
    week_number = ((start - first_monday).days // 7) + 1

    label = f"Week {week_number} {today.strftime('%B')}"
    return start, end, label
