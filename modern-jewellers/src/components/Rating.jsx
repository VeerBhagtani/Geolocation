import { StarIcon } from './Icons';
export default function Rating({ value = 0, count, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Rated ${value} out of 5`}>
      <span className="flex text-champagne-500">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon key={i} filled={value >= i - 0.25} width={size} height={size} />
        ))}
      </span>
      <span className="text-xs text-cocoa-400">
        {value.toFixed(1)}
        {count != null && ` (${count})`}
      </span>
    </span>
  );
}
