import os
import sys
from logging.config import fileConfig

from config import settings
from sqlalchemy import engine_from_config, pool
from alembic import context

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Load .env file (for DATABASE_URL)
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Set SQLAlchemy URL dynamically from env
config = context.config
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))

# Setup logging
if config.config_file_name:
    fileConfig(config.config_file_name)

# Import your Base and models
from db.database import Base
from models import (
    salesman,
    admin,
    actual_sale,
    product,
    claim,
    incentive,
    sale,
    trait_config,
    system,
    outlet,
    streak,
    verticle,
    leaderboardincentive,
    reward_log
)



target_metadata = Base.metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
