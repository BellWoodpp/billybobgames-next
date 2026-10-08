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
import { getPrimaryCategoryForGame } from "../_data/game-catalog";

type GameBreadcrumbProps = {
  current: string;
  className?: string;
  listClassName?: string;
  linkClassName?: string;
  pageClassName?: string;
  homeHref?: string;
  homeLabel?: string;
  gamePath?: string;
};

export default function GameBreadcrumb({
  current,
  className,
  listClassName,
  linkClassName,
  pageClassName,
  homeHref = "/",
  homeLabel = "Home",
  gamePath,
}: GameBreadcrumbProps) {
  const category = gamePath ? getPrimaryCategoryForGame(gamePath) : undefined;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className={cn("justify-center", listClassName)}>
        <BreadcrumbItem>
          <BreadcrumbLink asChild className={linkClassName}>
            <Link href={homeHref}>{homeLabel}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {category ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild className={linkClassName}>
                <Link href={`/${category.slug}`}>{category.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : null}
        <BreadcrumbItem>
          <BreadcrumbPage className={pageClassName}>{current}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
