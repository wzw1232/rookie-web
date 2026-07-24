// 列配置
export type CellType =
  | 'input'
  | 'monthRange'
  | 'dateRange'
  | 'select'
  | 'upload'
  | 'readonly'

export interface TableColumnConfig {
  title: string
  dataIndex: string
  width?: number
  // 是否分组跨行合并
  merge?: boolean
  // 单元格渲染类型
  type?: CellType
  // select下拉选项
  options?: { label: string; value: any }[]
  // 选日期后自动计算月份，赋值给哪个字段
  calcMonthTarget?: string
}

// 单行数据结构
export interface TableRowItem {
  _groupId: string // 分组唯一标识（同一个人一组）
  _isGroupFirst: boolean // 是否分组第一行
  [key: string]: any
}

// 组件入参
export interface GroupMultiTableProps {
  columns: TableColumnConfig[]
  value: TableRowItem[]
  // 分组依据字段，例 name
  groupKey: string
  // 自动计算月份
  autoCalcMonth?: boolean
  showOperate?: boolean
  operateWidth?: number
  onChange: (list: TableRowItem[]) => void
}
