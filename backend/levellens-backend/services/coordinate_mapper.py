def world_to_minimap(
    x,
    z,
    map_name
):

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

    config = MAP_CONFIG[map_name]

    scale = config["scale"]

    origin_x = config["origin_x"]
    origin_z = config["origin_z"]

    pixel_x = (
        (x - origin_x)
        / scale
    ) * 1024

    pixel_y = 1024 - (
        ((z - origin_z)
        / scale)
        * 1024
    )

    return pixel_x, pixel_y