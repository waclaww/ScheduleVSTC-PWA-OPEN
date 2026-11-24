import { Card } from '@heroui/react'

export function SettingsCard({ title, description, children }) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
        {description && <Card.Description className="truncate">{description}</Card.Description>}
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card>
  )
}
