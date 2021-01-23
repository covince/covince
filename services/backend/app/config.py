import logging
import os
from functools import lru_cache
from tortoise import Tortoise, run_async
from pydantic import BaseSettings, AnyUrl


log = logging.getLogger(__name__)


class Settings(BaseSettings):
    environment: str = os.getenv("ENVIRONMENT", "dev")
    testing: bool = os.getenv("TESTING", 0)
    user: str = os.environ.get("POSTGRES_USER")
    password: str = os.environ.get("POSTGRES_PASSWORD")
    service: str = os.environ.get("POSTGRES_SERVICE")
    port: int = os.environ.get("POSTGRES_PORT")
    db: str = os.environ.get("POSTGRES_DB")
    test_db: str = os.environ.get("POSTGRES_TEST_DB")
    database_url: AnyUrl = f"postgres://{user}:{password}@{service}:{port}/{db}"
    database_test_url: AnyUrl = f"postgres://{user}:{password}@{service}:{port}/{test_db}"


@lru_cache()
def get_settings() -> BaseSettings:
    log.info("Loading config settings from the environment...")
    return Settings()


async def generate_schema() -> None:
    log.info("Initializing Tortoise...")
    Settings = get_settings()
    await Tortoise.init(
        db_url=Settings.database_url, modules={"models": ["models"]},
    )
    log.info("Generating database schema via Tortoise...")
    await Tortoise.generate_schemas()
    await Tortoise.close_connections()


# new
if __name__ == "__main__":
    run_async(generate_schema())
