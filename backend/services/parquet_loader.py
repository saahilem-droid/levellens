import pandas as pd

def load_parquet():
    df = pd.read_parquet(
        "data/match.parquet"
    )

    df["event"] = df["event"].apply(
        lambda x:
        x.decode("utf-8")
        if isinstance(x, bytes)
        else x
    )

    return df