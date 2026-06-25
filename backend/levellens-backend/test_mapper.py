def world_to_minimap(
    x,
    z,
    scale,
    origin_x,
    origin_z
):

    u = (x - origin_x) / scale

    v = (z - origin_z) / scale

    pixel_x = u * 1024

    pixel_y = (1 - v) * 1024

    return pixel_x, pixel_y


x = -301.45
z = -355.55

px, py = world_to_minimap(
    x,
    z,
    900,
    -370,
    -473
)

print(px, py)