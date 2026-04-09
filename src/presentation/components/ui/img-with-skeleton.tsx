"use client";

import * as React from "react";
import { cn } from "./utils";

type ImageStatus = "loading" | "loaded" | "error";

type ImgWithSkeletonProps = Omit<React.ComponentProps<"img">, "alt"> & {
  alt: string;
  skeletonClassName?: string;
};

function ImgWithSkeleton({
  className,
  onLoad,
  onError,
  alt,
  src,
  skeletonClassName,
  ...props
}: ImgWithSkeletonProps) {
  const [status, setStatus] = React.useState<ImageStatus>("loading");
  const imageRef = React.useRef<HTMLImageElement | null>(null);

  React.useEffect(() => {
    setStatus("loading");
  }, [src]);

  React.useEffect(() => {
    const image = imageRef.current;
    if (!image || !image.complete) {
      return;
    }

    setStatus(image.naturalWidth > 0 ? "loaded" : "error");
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      ref={imageRef}
      alt={alt}
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

export { ImgWithSkeleton };
export type { ImgWithSkeletonProps };
