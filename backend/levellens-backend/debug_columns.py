from services.parquet_loader import load_parquet

df = load_parquet()

print(df.columns.tolist())

print("\n\nFIRST ROW\n")
print(df.iloc[0])