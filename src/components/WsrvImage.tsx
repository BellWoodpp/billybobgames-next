import { Image, type ImageProps } from "@unpic/react";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type WsrvImageProps = DistributiveOmit<ImageProps, "cdn" | "fallback">;

export function WsrvImage({ operations, ...props }: WsrvImageProps) {
  const layout = props.layout ?? "constrained";
  const breakpoints =
    props.breakpoints ??
    (layout === "fixed"
      ? undefined
      : layout === "fullWidth"
        ? [640, 960, 1280]
        : typeof props.width === "number"
          ? Array.from(
              new Set(
                [props.width, props.width * 2, props.width / 2]
                  .map((value) => Math.round(value))
                  .filter((value) => value >= 320 && value <= 1920),
              ),
            ).sort((a, b) => a - b)
          : undefined);

  return (
    <Image
      cdn="wsrv"
      operations={{
        ...operations,
        wsrv: { q: 75, we: true, ...(operations?.wsrv ?? {}) },
      }}
      breakpoints={breakpoints}
      {...props}
    />
  );
}
