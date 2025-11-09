from sqlalchemy.orm import Session
import pandas as pd

from app.database import get_db
from app.models import FMCGData
from sqlalchemy import inspect


def delete_null_rows():
    # Get DB session from your existing get_db()
    db: Session = next(get_db())
    try:
        # Get column names dynamically
        mapper = inspect(FMCGData)
        columns = [c.key for c in mapper.attrs]

        deleted_count = 0
        rows = db.query(FMCGData).all()

        for row in rows:
            delete_flag = False
            for col in columns:
                value = getattr(row, col)
                if value is None or (isinstance(value, float) and pd.isna(value)):
                    delete_flag = True
                    break

            if delete_flag:
                db.delete(row)
                deleted_count += 1
                print(deleted_count)

        db.commit()
        print(f"✅ Deleted {deleted_count} rows containing NaN/NULL values.")

    except Exception as e:
        db.rollback()
        print("❌ Error during cleaning:", e)
    finally:
        db.close()


if __name__ == "__main__":
    delete_null_rows()
