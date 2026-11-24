// Между дефисом и цифрой браузер строку не переносит — разрешаем явно
export function GroupName({ name }) {
  return name.split('-').map((part, index) => (
    <span key={index}>
      {index > 0 && '-'}
      {index > 0 && <wbr />}
      {part}
    </span>
  ))
}
