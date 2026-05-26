import unicornSvg from "../../../assets/symbols/unicorn-svgrepo-com.svg?raw";

type UnicornIconProps = {
  isWinning?: boolean;
  className?: string;
};

export function UnicornIcon({
  isWinning = false,
  className = "",
}: UnicornIconProps) {
  return (
    <span
      className={[
        "symbol-svg-wrap",
        "unicorn-icon",
        isWinning ? "symbol-svg-wrap--winning" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: unicornSvg }}
    />
  );
}
