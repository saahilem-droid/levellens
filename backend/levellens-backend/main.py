import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MAPS_DIR = os.path.join(BASE_DIR, "assets", "maps")
from services.parquet_loader import load_parquet
from services.coordinate_mapper import world_to_minimap
from services.file_scanner import scan_matches
from services.date_scanner import get_available_dates
from services.date_loader import load_date
from services.filter_builder import get_filters



MAP_CONFIG = {

    "AmbroseValley": {
        "scale": 900,
        "origin_x": -370,
        "origin_z": -473
    },

    "GrandRift": {
        "scale": 581,
        "origin_x": -290,
        "origin_z": -290
    },

    "Lockdown": {
        "scale": 1000,
        "origin_x": -500,
        "origin_z": -500
    }
}
MAP_MASKS = {

    "AmbroseValley":
        Image.open(
            os.path.join(MAPS_DIR, "AmbroseValley_Minimap.png")
        ).convert("RGB"),

    "Lockdown":
        Image.open(
            os.path.join(MAPS_DIR, "Lockdown_Minimap.jpg")
        ).convert("RGB"),

    "GrandRift":
        Image.open(
            os.path.join(MAPS_DIR, "GrandRift_Minimap.png")
        ).convert("RGB")
}






app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/debugmatchmovement/{date_name}/{match_id}")
def debugmatchmovement(
    date_name: str,
    match_id: str
):

    df = load_date(date_name)

    df = df[
        df["match_id"] == match_id
    ]

    return {
        "rows": len(df),
        "events": df["event"].value_counts().to_dict()
    }
@app.get("/debugbotpositions/{date_name}/{map_name}")
def debugbotpositions(
    date_name: str,
    map_name: str
):

    df = load_date(date_name)

    df = df[
        df["map_id"] == map_name
    ]

    return {
        "events":
        df["event"]
        .value_counts()
        .to_dict()
    }

@app.get("/debugmatch/{date_name}/{match_id}")
def debugmatch(
    date_name: str,
    match_id: str
):

    df = load_date(date_name)

    df = df[
        df["match_id"] == match_id
    ]

    return {
        "events":
        df["event"]
        .value_counts()
        .to_dict()
    }

@app.get("/testmask")
def testmask():

    mask = MAP_MASKS["AmbroseValley"]

    return {
        "width": mask.width,
        "height": mask.height
    }

@app.get("/debug")
def debug():

    df = load_date("Feb 10")

    return {
        "rows": len(df),
        "events": df["event"].unique().tolist()
    }
@app.get("/filters/{date_name}")
def filters(date_name: str):

    return get_filters(date_name)
@app.get("/positions/{date_name}/{map_name}/{match_id}")
def positions_by_match(
    date_name: str,
    map_name: str,
    match_id: str,
    type: str = "all"
):

    try:

        df = load_date(date_name)
        

        if df is None:
            return []
        if type == "human":
            df = df[
        ~df["event"]
        .astype(str)
        .str.startswith("Bot")
    ]
        elif type == "bot":
            df = df[
        df["event"]
        .astype(str)
        .str.startswith("Bot")
    ]

        df = df[
            df["map_id"] == map_name
        ]

        if match_id != "all":
            print(
                "TYPE =", type
                )
            print(
    df["event"]
    .value_counts()
    .to_dict()
)

            df = df[
                df["match_id"] == match_id
            ]

        positions = df[
    df["event"] == "Position"
]

        

        heatmap = {}

        for _, row in positions.iterrows():
            mask = MAP_MASKS[map_name]
            px, py = world_to_minimap(
    row["x"],
    row["z"],
    map_name
)
            if px < 0 or px > 1024:
                continue
            if py < 0 or py > 1024:
                continue

            
            print(
    "PATH POINT:",
    px,
    py
)
            mask_x = int(
                (px / 1024) * mask.width
            )
            mask_y = int(
                (py / 1024) * mask.height
            )
            if (
                mask_x < 0 or
                mask_x >= mask.width or
                mask_y < 0 or
                mask_y >= mask.height
            ):
                continue
            r, g, b = mask.getpixel(
                (mask_x, mask_y)
            )
            if (
                r < 120 and
                g < 100 and
                b < 100
                ):
                continue
            

            grid_x = int(px // 20)
            grid_y = int(py // 20)

            key = f"{grid_x}_{grid_y}"

            if key not in heatmap:

                heatmap[key] = {
                    "x": grid_x * 20,
                    "y": grid_y * 20,
                    "visits": 0
                }

            heatmap[key]["visits"] += 1
            
            print(
    "MATCH:",
    match_id,
    "POSITIONS:",
    len(positions),
    "HEATMAP CELLS:",
    len(heatmap)
)

        return list(heatmap.values())

    except Exception as e:

        return {
            "error": str(e)
        }
@app.get("/players/{date_name}/{map_name}/{match_id}")
def players(
    date_name: str,
    map_name: str,
    match_id: str
):

    df = load_date(date_name)

    if df is None:
        return []

    df = df[
        df["map_id"] == map_name
    ]

    df = df[
        df["match_id"] == match_id
    ]

    users = sorted(
        df["user_id"]
        .astype(str)
        .unique()
        .tolist()
    )

    return users
    
@app.get("/movement/{date_name}/{map_name}/{match_id}")
def movement_by_match(
    date_name: str,
    map_name: str,
    match_id: str,
    type: str = "all"
):

    try:

        df = load_date(date_name)

        if df is None:
            return []
        

        df = df[
            df["map_id"] == map_name
        ]

        if match_id != "all":

            df = df[
                df["match_id"] == match_id
            ]

        positions = df[
    df["event"] == "Position"
]

        

        heatmap = {}

        for _, row in positions.iterrows():
            mask = MAP_MASKS[map_name]
            px, py = world_to_minimap(
    row["x"],
    row["z"],
    map_name
)
            mask_x = int(
                (px / 1024) * mask.width
            )
            mask_y = int(
                (py / 1024) * mask.height
            )
            if (
                mask_x < 0 or
                mask_x >= mask.width or
                mask_y < 0 or
                mask_y >= mask.height
            ):
                continue
            r, g, b = mask.getpixel(
                (mask_x, mask_y)
            )
            if (
                r < 120 and
                g < 100 and
                b < 100
                ):
                continue
            

            grid_x = int(px // 20)
            grid_y = int(py // 20)

            key = f"{grid_x}_{grid_y}"

            if key not in heatmap:

                heatmap[key] = {
                    "x": grid_x * 20,
                    "y": grid_y * 20,
                    "visits": 0
                }

            heatmap[key]["visits"] += 1
            
            print(
    "TYPE:", type,
    "POSITION ROWS:", len(positions)
)

        return list(heatmap.values())

    except Exception as e:

        return {
            "error": str(e)
        }
@app.get("/loot/{date_name}/{map_name}/{match_id}")
def loot_by_match(
    date_name: str,
    map_name: str,
    match_id: str,
    type: str = "all"
):

    try:

        df = load_date(date_name)

        if df is None:
            return []
        

        df = df[
            df["map_id"] == map_name
        ]

        if match_id != "all":

            df = df[
                df["match_id"] == match_id
            ]

        positions = df[
            df["event"] == "Loot"
        ]

        

        heatmap = {}

        for _, row in positions.iterrows():
            mask = MAP_MASKS[map_name]

            px, py = world_to_minimap(
    row["x"],
    row["z"],
    map_name
)
            mask_x = int(
                (px / 1024) * mask.width
            )
            mask_y = int(
                (py / 1024) * mask.height
            )
            if (
                mask_x < 0 or
                mask_x >= mask.width or
                mask_y < 0 or
                mask_y >= mask.height
            ):
                continue
            r, g, b = mask.getpixel(
                (mask_x, mask_y)
            )
            if (
                r < 120 and
                g < 100 and
                b < 100
                ):
                continue
            

            grid_x = int(px // 20)
            grid_y = int(py // 20)

            key = f"{grid_x}_{grid_y}"

            if key not in heatmap:

                heatmap[key] = {
                    "x": grid_x * 20,
                    "y": grid_y * 20,
                    "visits": 0
                }

            heatmap[key]["visits"] += 1
            

        return list(heatmap.values())

    except Exception as e:

        return {
            "error": str(e)
        }
@app.get("/deaths/{date_name}/{map_name}/{match_id}")
def deaths_by_match(
    date_name: str,
    map_name: str,
    match_id: str,
    type: str = "all"
):

    try:

        df = load_date(date_name)

        if df is None:
            return []
       

        df = df[
            df["map_id"] == map_name
        ]

        if match_id != "all":

            df = df[
                df["match_id"] == match_id
            ]

        positions = df[
            df["event"].isin([
                "Kill",
                "Killed",
                "BotKill",
                "BotKilled"
            ])
        ]

        

        heatmap = {}

        for _, row in positions.iterrows():
            mask = MAP_MASKS[map_name]

            px, py = world_to_minimap(
    row["x"],
    row["z"],
    map_name
)
            mask_x = int(
                (px / 1024) * mask.width
            )
            mask_y = int(
                (py / 1024) * mask.height
            )
            if (
                mask_x < 0 or
                mask_x >= mask.width or
                mask_y < 0 or
                mask_y >= mask.height
            ):
                continue
            r, g, b = mask.getpixel(
                (mask_x, mask_y)
            )
            if (
                r < 120 and
                g < 100 and
                b < 100
                ):
                continue
            

            grid_x = int(px // 20)
            grid_y = int(py // 20)

            key = f"{grid_x}_{grid_y}"

            if key not in heatmap:

                heatmap[key] = {
                    "x": grid_x * 20,
                    "y": grid_y * 20,
                    "visits": 0
                }

            heatmap[key]["visits"] += 1
            

        return list(heatmap.values())

    except Exception as e:

        return {
            "error": str(e)
        }
@app.get("/kills/{date_name}/{map_name}/{match_id}")
def kills_by_match(
    date_name: str,
    map_name: str,
    match_id: str,
    type: str = "all"
):
    try:
        df = load_date(date_name)

        if df is None:
            return []

        df = df[df["map_id"] == map_name]

        if match_id != "all":
            df = df[df["match_id"] == match_id]

        positions = df[
            df["event"].isin([
                "Kill"
                
            ])
        ]

        heatmap = {}

        for _, row in positions.iterrows():
            mask = MAP_MASKS[map_name]
            px, py = world_to_minimap(
                row["x"],
                row["z"],
                map_name
            )
            mask_x = int((px / 1024) * mask.width)
            mask_y = int((py / 1024) * mask.height)
            if (
                mask_x < 0 or
                mask_x >= mask.width or
                mask_y < 0 or
                mask_y >= mask.height
            ):
                continue
            r, g, b = mask.getpixel((mask_x, mask_y))
            if r < 120 and g < 100 and b < 100:
                continue

            grid_x = int(px // 20)
            grid_y = int(py // 20)
            key = f"{grid_x}_{grid_y}"

            if key not in heatmap:
                heatmap[key] = {
                    "x": grid_x * 20,
                    "y": grid_y * 20,
                    "visits": 0
                }
            heatmap[key]["visits"] += 1

        return list(heatmap.values())

    except Exception as e:
        return {"error": str(e)}
@app.get("/botkills/{date_name}/{map_name}/{match_id}")
def botkills_by_match(
    date_name: str,
    map_name: str,
    match_id: str,
    type: str = "all"
):
    try:
        df = load_date(date_name)
        if df is None:
            return []

        df = df[df["map_id"] == map_name]

        if match_id != "all":
            df = df[df["match_id"] == match_id]

        positions = df[df["event"] == "BotKill"]

        heatmap = {}

        for _, row in positions.iterrows():
            mask = MAP_MASKS[map_name]
            px, py = world_to_minimap(row["x"], row["z"], map_name)
            mask_x = int((px / 1024) * mask.width)
            mask_y = int((py / 1024) * mask.height)
            if (
                mask_x < 0 or
                mask_x >= mask.width or
                mask_y < 0 or
                mask_y >= mask.height
            ):
                continue
            r, g, b = mask.getpixel((mask_x, mask_y))
            if r < 120 and g < 100 and b < 100:
                continue

            grid_x = int(px // 20)
            grid_y = int(py // 20)
            key = f"{grid_x}_{grid_y}"

            if key not in heatmap:
                heatmap[key] = {
                    "x": grid_x * 20,
                    "y": grid_y * 20,
                    "visits": 0
                }
            heatmap[key]["visits"] += 1

        return list(heatmap.values())

    except Exception as e:
        return {"error": str(e)}
@app.get("/storm/{date_name}/{map_name}/{match_id}")
def storm_by_match(
    date_name: str,
    map_name: str,
    match_id: str
):

    df = load_date(date_name)

    if df is None:
        return []

    df = df[
        df["map_id"] == map_name
    ]

    if match_id != "all":

        df = df[
            df["match_id"] == match_id
        ]

    positions = df[
        df["event"] == "KilledByStorm"
    ]

    

    heatmap = {}

    for _, row in positions.iterrows():

        px, py = world_to_minimap(
    row["x"],
    row["z"],
    map_name
)

        grid_x = int(px // 20)
        grid_y = int(py // 20)

        key = f"{grid_x}_{grid_y}"

        if key not in heatmap:

            heatmap[key] = {
                "x": grid_x * 20,
                "y": grid_y * 20,
                "visits": 0
            }

        heatmap[key]["visits"] += 1

    return list(heatmap.values())
@app.get("/paths/{date_name}/{map_name}/{match_id}")
def paths(
    date_name: str,
    map_name: str,
    match_id: str,
    type: str = "all"
):
    df = load_date(date_name)

    if df is None:
        return []

    df = df[df["map_id"] == map_name]

    if match_id != "all":
        df = df[df["match_id"] == match_id]

    positions = df[
        df["event"].isin(["Position", "BotPosition"])
    ].sort_values(by="ts")

    result = []

    for player_id, player_df in positions.groupby("user_id"):
        points = []

        for _, row in player_df.iterrows():
            px, py = world_to_minimap(row["x"], row["z"], map_name)
            points.append({
                "x": float(px),
                "y": float(py)
            })

        if not points:
            continue

        is_bot = player_df["event"].iloc[0] == "BotPosition"

        # ── FIX: append ONCE per player, outside the point loop ──
        result.append({
            "player": str(player_id),
            "is_bot": bool(is_bot),
            "points": points
        })

    return result

@app.get("/replay/{date_name}/{map_name}/{match_id}")
def replay(
    date_name: str,
    map_name: str,
    match_id: str,
    player_id: str = "all"
):

    df = load_date(date_name)

    if df is None:
        return []

    df = df[
        df["map_id"] == map_name
    ]

    if match_id != "all":

        df = df[
            df["match_id"] == match_id
        ]
        

    events = df[
    df["event"].isin([
        "Position",
        "BotPosition",
        "Loot",
        "Kill",
        "Killed",
        "BotKill",
        "BotKilled",
        "KilledByStorm"
    ])
]

    events = events.sort_values(
    by="ts"
)
    from collections import defaultdict
    players = defaultdict(list)
    for _, row in events.iterrows():
        px, py = world_to_minimap(
            row["x"],
            row["z"],
            map_name
            )
        players[
            str(row["user_id"])
        ].append({
            "x": float(px),
            "y": float(py),
            "ts": str(row["ts"]),
            "type": str(row["event"])
            })
    result = []
    for player_id, points in players.items():
        is_bot = any(
    p["type"] == "BotPosition"
    for p in points
)
        result.append({
    "player": player_id,
    "is_bot": bool(is_bot),
    "points": points
})
    return result

@app.get("/playercount/{date_name}/{map_name}/{match_id}")
def playercount(
    date_name: str,
    map_name: str,
    match_id: str
):
    df = load_date(date_name)

    if df is None:
        return {"count": 0}

    df = df[df["map_id"] == map_name]

    if match_id != "all":
        df = df[df["match_id"] == match_id]

    count = int(
        df["user_id"]
        .astype(str)
        .nunique()
    )

    return {"count": count}
@app.get("/debugusers/{date_name}/{map_name}/{match_id}")
def debug_users(
    date_name: str,
    map_name: str,
    match_id: str
):

    df = load_date(date_name)

    df = df[
        df["map_id"] == map_name
    ]

    if match_id != "all":

        df = df[
            df["match_id"] == match_id
        ]

        if player_id != "all":
            df = df[
                df["user_id"].astype(str)
                == player_id
            ]

    positions = df[
        df["event"].isin([
            "Position",
            "BotPosition"
        ])
    ]

    return {
        "user_count":
            int(
                positions["user_id"]
                .nunique()
            ),

        "users":
            positions["user_id"]
            .unique()
            .tolist()
    }
@app.get("/debugstorm/{date_name}/{map_name}/{match_id}")
def debugstorm(
    date_name: str,
    map_name: str,
    match_id: str
):

    df = load_date(date_name)

    df = df[
        df["map_id"] == map_name
    ]

    if match_id != "all":
        df = df[
            df["match_id"] == match_id
        ]

    storm = df[
        df["event"] == "KilledByStorm"
    ]

    return {
        "count": len(storm),
        "sample": storm.head(5).to_dict(
            orient="records"
        )
    }

@app.get("/debugfiles/{date_name}")
def debugfiles(date_name: str):

    import os

    folder = os.path.join(
        "data",
        date_name
    )

    return os.listdir(folder)[:20]


@app.get("/debugmap/{date_name}/{map_name}")
def debugmap(
    date_name: str,
    map_name: str
):

    df = load_date(date_name)

    df = df[
        df["map_id"] == map_name
        
    ]

    return {
        "rows": len(df),
        "maps": df["map_id"].unique().tolist()
    }
@app.get("/debugmatch/{date_name}/{map_name}")
def debugmatch(
    date_name: str,
    map_name: str
):

    df = load_date(date_name)

    return {
        "rows": len(df),
        "maps": df["map_id"].unique().tolist(),
        "events": df["event"].unique().tolist()
    }
@app.get("/debugmaps/{date_name}")
def debugmaps(date_name: str):

    try:

        df = load_date(date_name)

        return {
            "columns": df.columns.tolist(),
            "rows": len(df),
            "maps": df["map_id"].unique().tolist()
        }
    

    except Exception as e:

        return {
            "error": str(e)
        }
@app.get("/debugloot/{date_name}/{map_name}")
def debugloot(
    date_name: str,
    map_name: str
):

    df = load_date(date_name)

    df = df[
        df["map_id"] == map_name
    ]

    return {
        "events":
        df["event"].value_counts().to_dict()
    }
@app.get("/debuglootrows/{date_name}/{map_name}")
def debuglootrows(
    date_name: str,
    map_name: str
):

    df = load_date(date_name)

    df = df[
        (df["map_id"] == map_name)
        &
        (df["event"] == "Loot")
    ]

    return {
        "rows": len(df),
        "sample":
        df.head(5).to_dict(
            orient="records"
        )
    }
@app.get("/debugfilecount/{date_name}")
def debugfilecount(date_name: str):

    import os

    folder = os.path.join(
        "data",
        date_name
    )

    files = os.listdir(folder)

    return {
        "count": len(files),
        "first_10": files[:10]
    }
@app.get("/debugfirstfile/{date_name}")
def debugfirstfile(date_name: str):

    import os
    import pandas as pd

    folder = os.path.join(
        "data",
        date_name
    )

    first_file = os.listdir(folder)[0]

    path = os.path.join(
        folder,
        first_file
    )

    df = pd.read_parquet(path)

    return {
        "file": first_file,
        "columns": df.columns.tolist(),
        "map_id": str(df["map_id"].iloc[0]),
        "match_id": str(df["match_id"].iloc[0]),
        "event_type": str(type(df["event"].iloc[0])),
        "event_sample": str(df["event"].iloc[0])
    }
@app.get("/debugdecoded/{date_name}")
def debugdecoded(date_name: str):

    try:

        df = load_date(date_name)

        return {
            "rows": len(df),
            "event_column_exists": "event" in df.columns,
            "event_type": str(
                type(df["event"].iloc[0])
            ),
            "sample": str(
                df["event"].iloc[0]
            )
        }

    except Exception as e:

        return {
            "error": str(e)
        }
@app.get("/debugpositions/{date_name}/{map_name}")
def debugpositions(
    date_name: str,
    map_name: str
):

    df = load_date(date_name)

    return {
        "total_rows": len(df),

        "unique_maps":
        df["map_id"].unique().tolist(),

        "ambrose_rows":
        len(
            df[
                df["map_id"] == map_name
            ]
        )
    }
@app.get("/debugevents/{date_name}")
def debugevents(date_name: str):

    df = load_date(date_name)

    return {
        "event_type":
        str(type(df["event"].iloc[0])),

        "sample":
        str(df["event"].iloc[0]),

        "unique":
        df["event"].unique().tolist()[:10]
    }
@app.get("/testload")
def testload():

    try:

        df = load_date("Feb 10")

        return {
            "rows": len(df),
            "columns": df.columns.tolist()
        }

    except Exception as e:

        return {
            "error": str(e)
        }
    
@app.get("/debugmatchcount/{date_name}")
def debugmatchcount(date_name: str):

    df = load_date(date_name)

    return {
        "rows": len(df),
        "position_rows": len(
            df[df["event"] == "Position"]
        )
    }
@app.get("/debugpositions")
def debugpositions():

    df = load_date("Feb 10")

    return {
        "first_20_events": df["event"].head(20).tolist()
    }
@app.get("/debugtypes")
def debugtypes():

    df = load_date("Feb 10")

    return {
        "event_dtype": str(df["event"].dtype),
        "first_type": str(type(df["event"].iloc[0]))
    }
@app.get("/")
def home():
    return {"message": "LevelLens Running"}


@app.get("/date/{date}")
def get_date(date: str):

    df = load_date(date)

    if df is None:

        return {
            "matches": 0
        }

    return {
        "matches": len(
            df["match_id"].unique()
        ),
        "players": len(
            df["user_id"].unique()
        )
    }
@app.get("/dates")
def dates():

    return {
        "dates": get_available_dates()
    }
@app.get("/scan")
def scan():

    return scan_matches()
@app.get("/matchinfo/{date_name}")
def matchinfo(date_name: str):

    df = load_date(date_name)

    return {
        "map": str(
            df["map_id"].iloc[0]
        )
    }

from services.date_loader import load_date


@app.get("/testpositions")
def testpositions():

    return [
        {
            "x": 100,
            "y": 100,
            "visits": 5
        }
    ]
@app.get("/hello")
def hello():
    return {
        "message": "HELLO TEST"
    }