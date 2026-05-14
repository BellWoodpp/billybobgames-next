import type { ImageProps } from "@unpic/react";
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

export function WsrvImage({ operations, ...props }: WsrvImageProps) {
  const directProps = props as DevRenderableProps;
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
  } = directProps;

  void breakpoints;
  void operations;

  const directStyle: CSSProperties = {
    ...(background ? { background } : null),
    ...(aspectRatio ? { aspectRatio } : null),
    ...style,
  };

  if (!unstyled) {
    if (layout === "fixed") {
      if (directStyle.width == null && width != null) directStyle.width = width;
      if (directStyle.height == null && height != null) directStyle.height = height;
    } else {
      if (directStyle.width == null) directStyle.width = "100%";
      if (directStyle.maxWidth == null) directStyle.maxWidth = "100%";
      if (directStyle.height == null) directStyle.height = "auto";
    }
  }

  return (
    <img
      {...imgProps}
      alt={alt}
      src={src}
      width={typeof width === "number" ? width : undefined}
      height={typeof height === "number" ? height : undefined}
      loading={directProps.loading ?? (priority ? "eager" : undefined)}
      fetchPriority={priority ? "high" : imgProps.fetchPriority}
      style={directStyle}
    />
  );
}
