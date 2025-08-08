import Link from "next/link";
import { ButtonHTMLAttributes, AnchorHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & {
    href: string;
  };

export default function Button(
  props: PropsWithChildren<ButtonAsButton | ButtonAsLink>
) {
  const { variant = "primary", size = "md", className = "", children, ...rest } = props as any;
  const classes = [
    "btn",
    variant ? `btn-${variant}` : "",
    size && size !== "md" ? `btn-${size}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if ("href" in props && props.href) {
    const { href, ...anchorProps } = rest as ButtonAsLink;
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={classes} {...(anchorProps as any)}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={classes} {...(anchorProps as any)}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonAsButton)}>
      {children}
    </button>
  );
}


