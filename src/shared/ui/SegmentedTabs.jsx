import { Tabs } from '@heroui/react'

// Переключатель на всю ширину: items — [{ id, label, ariaLabel? }]
export function SegmentedTabs({ ariaLabel, items, selectedKey, onChange }) {
  return (
    <Tabs className="w-full" selectedKey={selectedKey} onSelectionChange={(key) => onChange(String(key))}>
      <Tabs.ListContainer className="w-full">
        <Tabs.List aria-label={ariaLabel} className="w-full">
          {items.map((item) => (
            <Tabs.Tab key={item.id} aria-label={item.ariaLabel} id={item.id}>
              {item.label}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  )
}
