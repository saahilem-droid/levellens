import os
import pandas as pd

def scan_matches():

    data_folder = "data"

    maps = {}

    files_processed = 0

    for filename in os.listdir(data_folder):

        file_path = os.path.join(
            data_folder,
            filename
        )

        if not os.path.isfile(file_path):
            continue

        try:

            df = pd.read_parquet(file_path)

            map_name = str(
                df["map_id"].iloc[0]
            )

            if map_name not in maps:

                maps[map_name] = {
                    "matches": 0,
                    "files": []
                }

            maps[map_name]["matches"] += 1

            maps[map_name]["files"].append(
                filename
            )

            files_processed += 1

        except Exception as e:

            print(
                f"Failed to load {filename}"
            )

    return {
        "maps": maps,
        "totalFiles": files_processed
    }