import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  wrapperClassName?: string;
  containerClassName?: string;
};

export default function PageShell({
  children,
  wrapperClassName,
  containerClassName,
}: PageShellProps) {
  const wrapperClasses = ["page-wrapper", wrapperClassName].filter(Boolean).join(" ");
  const containerClasses = ["container", containerClassName].filter(Boolean).join(" ");

  return (
    <div className={wrapperClasses}>
      <div className={containerClasses}>{children}</div>
    </div>
  );
}
