export default function rand(value) {
  return (Math.random() - 0.5) * (value || 1);
}
