'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface IntentFiltersProps {
  searchTerm: string
  selectedStatus: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export default function IntentFilters({
  searchTerm,
  selectedStatus,
  onSearchChange,
  onStatusChange,
}: IntentFiltersProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filtrar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              placeholder="Nome, email ou empresa..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => onStatusChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PENDING">Pendentes</SelectItem>
                <SelectItem value="APPROVED">Aprovados</SelectItem>
                <SelectItem value="REJECTED">Rejeitados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

