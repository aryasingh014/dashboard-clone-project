
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NodeSelectorProps {
  nodeIds: string[]
  selectedNodeId: string
  onNodeSelect: (nodeId: string) => void
}

export function NodeSelector({ nodeIds, selectedNodeId, onNodeSelect }: NodeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Node ID</label>
      <Select value={selectedNodeId} onValueChange={onNodeSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a node" />
        </SelectTrigger>
        <SelectContent>
          {nodeIds.map((nodeId) => (
            <SelectItem key={nodeId} value={nodeId}>
              {nodeId}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
