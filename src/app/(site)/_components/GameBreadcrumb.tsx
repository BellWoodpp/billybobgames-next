"use client";
// 面包屑导航

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type GameBreadcrumbProps = {
  current: string;
  className?: string;
  listClassName?: string;
  linkClassName?: string;
  pageClassName?: string;
  homeHref?: string;
  homeLabel?: string;
};

export default function GameBreadcrumb({
  current,
  className,
  listClassName,
  linkClassName,
  pageClassName,
  homeHref = "/",
  homeLabel = "Home",
}: GameBreadcrumbProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className={cn("justify-center", listClassName)}>
        <BreadcrumbItem>
          <BreadcrumbLink asChild className={linkClassName}>
            <Link href={homeHref}>{homeLabel}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className={pageClassName}>{current}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
