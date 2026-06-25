import os
import pandas as pd

def get_filters(date_name):

    folder = os.path.join(
        "data",
        date_name
    )

    maps = {}
    seen_matches = set()

    for file in os.listdir(folder):

        path = os.path.join(
            folder,
            file
        )

        # Skip folders
        if os.path.isdir(path):
            continue

        # Try reading as parquet
        try:
            df = pd.read_parquet(path)
        except Exception:
            continue

        map_name = str(
            df["map_id"].iloc[0]
        )

        if map_name not in maps:
            maps[map_name] = []

        match_id = str(
            df["match_id"].iloc[0]
        )
        key = f"{map_name}_{match_id}"
        if key in seen_matches:
             continue
        seen_matches.add(key)

        events = df["event"].astype(str).unique().tolist()
        is_bot = any(
    event.startswith("Bot")
    for event in events
)
        

        maps[map_name].append({
            "match_id": match_id,
            "is_bot": is_bot
            })

    return maps