import os
import pandas as pd

def load_date(date_name):

    folder = os.path.join(
        "data",
        date_name
    )

    dfs = []

    for file in os.listdir(folder):
        path = os.path.join(
        folder,
        file
    )
        if os.path.isdir(path):
            continue
        try:
            df = pd.read_parquet(path)
            df["event"] = df["event"].apply(
            lambda x: x.decode("utf-8")
            if isinstance(x, bytes)
            else x
        )
            dfs.append(df)
        except Exception as e:
            print(
            "FAILED:",
            file,
            str(e)
        )
    print("FILES FOUND:", len(dfs))

    if len(dfs) == 0:
        return None

    return pd.concat(
        dfs,
        ignore_index=True
    )