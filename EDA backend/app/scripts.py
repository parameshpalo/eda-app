import pandas as pd
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import FMCGData
from app.database import Base

# ------------------------
# Create tables if not exist
# ------------------------
Base.metadata.create_all(bind=engine)

# ------------------------
# CSV Path
# ------------------------
csv_file = "C:/Users/param/OneDrive/Desktop/New folder/fmcg_data.csv"

# ------------------------
# Read CSV safely
# ------------------------
df = pd.read_csv(
    csv_file,
    na_values=['NaT', '', ' '],
    keep_default_na=True
)

# ------------------------
# Fix date column
# ------------------------
df['date'] = pd.to_datetime(df['date'], format='%d-%m-%Y', errors='coerce')
df['date'] = df['date'].apply(lambda x: x.date() if pd.notna(x) else None)

# ------------------------
# Define numeric columns
# ------------------------
numeric_cols = [
    'SalesValue','Volume','VolumeUnits',
    'D1','D2','D3','D4','D5','D6',
    'AV1','AV2','AV3','AV4','AV5','AV6',
    'EV1','EV2','EV3','EV4','EV5','EV6'
]

# Convert all numeric columns to float safely
for col in numeric_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0)

# ------------------------
# Convert integer columns safely
# ------------------------
int_cols = ['Year','Month','Week']
for col in int_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)

# ------------------------
# Prepare list of FMCGData objects
# ------------------------
records = []
for _, row in df.iterrows():
    record = FMCGData(
        market=row.get('Market'),
        channel=row.get('Channel'),
        region=row.get('Region'),
        category=row.get('Category'),
        sub_category=row.get('SubCategory'),
        brand=row.get('Brand'),
        variant=row.get('Variant'),
        pack_type=row.get('PackType'),
        ppg=row.get('PPG'),
        pack_size=row.get('PackSize'),
        year=row.get('Year') if pd.notna(row.get('Year')) else None,
        month=row.get('Month') if pd.notna(row.get('Month')) else None,
        week=row.get('Week') if pd.notna(row.get('Week')) else None,
        date=row.get('date'),
        br_cat_id=row.get('BrCatId'),
        sales_value=row.get('SalesValue', 0.0),
        volume=row.get('Volume', 0.0),
        volume_units=row.get('VolumeUnits', 0.0),
        d1=row.get('D1', 0.0),
        d2=row.get('D2', 0.0),
        d3=row.get('D3', 0.0),
        d4=row.get('D4', 0.0),
        d5=row.get('D5', 0.0),
        d6=row.get('D6', 0.0),
        AV1=row.get('AV1', 0.0),
        AV2=row.get('AV2', 0.0),
        AV3=row.get('AV3', 0.0),
        AV4=row.get('AV4', 0.0),
        AV5=row.get('AV5', 0.0),
        AV6=row.get('AV6', 0.0),
        EV1=row.get('EV1', 0.0),
        EV2=row.get('EV2', 0.0),
        EV3=row.get('EV3', 0.0),
        EV4=row.get('EV4', 0.0),
        EV5=row.get('EV5', 0.0),
        EV6=row.get('EV6', 0.0),
    )
    records.append(record)

# ------------------------
# Insert into DB
# ------------------------
db: Session = SessionLocal()

try:
    db.bulk_save_objects(records)
    db.commit()
    print(f"Successfully inserted {len(records)} records!")

except Exception as e:
    db.rollback()
    print("Error inserting data:", e)

finally:
    db.close()
