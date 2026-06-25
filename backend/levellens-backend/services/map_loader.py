import os
import pandas as pd

def load_all_matches():

    folder = "data"

    maps = {}

    for file in os.listdir(folder):

        if not file.endswith(".parquet"):
            continue

        path = os.path.join(folder, file)

        df = pd.read_parquet(path)

        map_name = df["map_id"].iloc[0]

        if map_name not in maps:
            maps[map_name] = []

        maps[map_name].append(df)

    result = {}

    for map_name in maps:

        result[map_name] = pd.concat(
            maps[map_name],
            ignore_index=True
        )

    return result