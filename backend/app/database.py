from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./assets.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def run_schema_migrations():
    """Apply small, backwards-compatible schema changes without deleting existing data."""
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    if "users" not in tables:
        return

    columns = {column["name"] for column in inspector.get_columns("users")}
    additions = {
        "last_login": "DATETIME",
        "disabled_at": "DATETIME",
        "disabled_reason": "VARCHAR(255)",
    }

    with engine.begin() as connection:
        for column_name, column_type in additions.items():
            if column_name not in columns:
                connection.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"))

        if "assets" in tables:
            asset_columns = {column["name"] for column in inspector.get_columns("assets")}
            if "location" in asset_columns:
                connection.execute(
                    text("UPDATE assets SET location = 'APEX HUB' WHERE location IS NULL OR TRIM(location) = ''")
                )


# Run before application startup so existing SQLite databases receive the new columns.
run_schema_migrations()
