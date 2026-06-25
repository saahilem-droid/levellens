from services.parquet_loader import load_parquet

df = load_parquet()

positions = df[
    df["event"] == "Position"
]

print(
    positions["user_id"]
    .nunique()
)

print(
    positions["user_id"]
    .unique()
)