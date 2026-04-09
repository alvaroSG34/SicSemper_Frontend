"use client";

import * as React from "react";
import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { cn } from "./utils";

type ImageStatus = "loading" | "loaded" | "error";

type ImageWithSkeletonProps = NextImageProps & {
  skeletonClassName?: string;
};

function ImageWithSkeleton({
  className,
  onLoad,
  onError,
  src,
  skeletonClassName,
  ...props
}: ImageWithSkeletonProps) {
  const [status, setStatus] = React.useState<ImageStatus>("loading");

  React.useEffect(() => {
    setStatus("loading");
  }, [src]);

  const handleLoad: React.ReactEventHandler<HTMLImageElement> = (event) => {
    setStatus("loaded");
    onLoad?.(event);
  };

  const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    setStatus("error");
    onError?.(event);
  };

  return (
    <NextImage
      {...props}
      src={src}
      onLoad={handleLoad}
      onError={handleError}
      data-image-status={status}
      className={cn(
        className,
        status === "loading" ? "ui-skeleton opacity-0" : "opacity-100",
        status === "loading" ? skeletonClassName : undefined,
      )}
    />
  );
}

export { ImageWithSkeleton };
export type { ImageWithSkeletonProps };
