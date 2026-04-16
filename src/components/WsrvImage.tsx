import { Image, type ImageProps } from "@unpic/react";
import type { CSSProperties } from "react";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type WsrvImageProps = DistributiveOmit<ImageProps, "cdn" | "fallback">;

type DevRenderableProps = WsrvImageProps & {
  alt?: string;
  aspectRatio?: CSSProperties["aspectRatio"];
  background?: CSSProperties["background"];
  breakpoints?: number[];
  height?: number | string;
  layout?: "constrained" | "fixed" | "fullWidth";
  priority?: boolean;
  src: string;
  style?: CSSProperties;
  unstyled?: boolean;
  width?: number | string;
};

const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export function WsrvImage({ operations, ...props }: WsrvImageProps) {
  if (IS_DEVELOPMENT) {
    const devProps = props as DevRenderableProps;
    const {
      alt,
      aspectRatio,
      background,
      breakpoints,
      layout,
      priority,
      src,
      style,
      unstyled,
      width,
      height,
      ...imgProps
    } = devProps;

    void breakpoints;

    const devStyle: CSSProperties = {
      ...(background ? { background } : null),
      ...(aspectRatio ? { aspectRatio } : null),
      ...style,
    };

    if (!unstyled) {
      if (layout === "fixed") {
        if (devStyle.width == null && width != null) devStyle.width = width;
        if (devStyle.height == null && height != null) devStyle.height = height;
      } else {
        if (devStyle.width == null) devStyle.width = "100%";
        if (devStyle.maxWidth == null) devStyle.maxWidth = "100%";
        if (devStyle.height == null) devStyle.height = "auto";
      }
    }

    return (
      <img
        {...imgProps}
        alt={alt}
        src={src}
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        loading={devProps.loading ?? (priority ? "eager" : undefined)}
        fetchPriority={priority ? "high" : imgProps.fetchPriority}
        style={devStyle}
      />
    );
  }

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
      alt={props.alt}
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
