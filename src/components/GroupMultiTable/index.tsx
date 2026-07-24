import { CopyOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, DatePicker, Input, message, Select, Table, Upload } from 'antd'
import dayjs from 'dayjs'
import React, { useMemo } from 'react'
import './index.less'
import type {
  GroupMultiTableProps,
  TableColumnConfig,
  TableRowItem,
} from './type.d.ts'

const { RangePicker } = DatePicker
const { Option } = Select

const GroupMultiTable: React.FC<GroupMultiTableProps> = (props) => {
  const {
    columns,
    value: tableList,
    groupKey,
    autoCalcMonth = true,
    showOperate = true,
    operateWidth = 180,
    onChange,
  } = props

  // 更新列表
  const updateList = (newList: TableRowItem[]) => {
    onChange([...newList])
  }

  // ==================== 单元格合并计算 ====================
  const spanConfig = useMemo(() => {
    const spanMap: Record<string, { rowSpan: number; colSpan: number }> = {}
    // 按分组聚合
    const groupMap: Record<string, TableRowItem[]> = {}
    tableList.forEach((row, idx) => {
      if (!groupMap[row._groupId]) groupMap[row._groupId] = []
      groupMap[row._groupId].push({ ...row, index: idx })
    })

    // 遍历每一列，处理merge列合并
    columns.forEach((col, colIdx) => {
      if (!col.merge) return
      Object.values(groupMap).forEach((groupRows) => {
        groupRows.forEach((item, rowIdxInGroup) => {
          const key = `${item.index}-${colIdx}`
          if (rowIdxInGroup === 0) {
            spanMap[key] = { rowSpan: groupRows.length, colSpan: 1 }
          } else {
            spanMap[key] = { rowSpan: 0, colSpan: 0 }
          }
        })
      })
    })
    return spanMap
  }, [tableList, columns])

  // 合并单元格回调
  const cellSpan = (
    row: TableRowItem,
    column: TableColumnConfig,
    rowIdx: number,
    colIdx: number,
  ) => {
    const key = `${rowIdx}-${colIdx}`
    return spanConfig[key] || { rowSpan: 1, colSpan: 1 }
  }

  // ==================== 月份自动计算 ====================
  const handleDateChange = (
    rowIdx: number,
    row: TableRowItem,
    col: TableColumnConfig,
    dates: dayjs.Dayjs[],
    // dates: NoUndefinedRangeValueType<Dayjs> | null,
  ) => {
    if (!autoCalcMonth || !col.calcMonthTarget || !dates?.length) return
    const start = dates[0]
    const end = dates[1]
    const months = end.diff(start, 'month') + 1
    tableList[rowIdx][col.calcMonthTarget] = months
    updateList(tableList)
  }

  // ==================== 操作方法 ====================
  // 删除单行
  const handleDelete = (idx: number) => {
    const newList = [...tableList]
    newList.splice(idx, 1)
    updateList(newList)
    message.success('删除成功')
  }

  // 复制当前行
  const handleCopy = (idx: number) => {
    const origin = tableList[idx]
    const newRow: TableRowItem = {
      ...origin,
      _isGroupFirst: false,
      _groupId: origin._groupId,
    }
    const newList = [...tableList]
    newList.splice(idx + 1, 0, newRow)
    updateList(newList)
    message.success('复制成功')
  }

  // 同分组新增一行（核心：操作列加号）
  const handleAddSameGroupRow = (row: TableRowItem) => {
    const newRow: TableRowItem = {
      _groupId: row._groupId,
      _isGroupFirst: false,
      [groupKey]: row[groupKey],
    }
    const idx = tableList.findLastIndex(
      (item) => item._groupId === row._groupId,
    )
    const newList = [...tableList]
    newList.splice(idx + 1, 0, newRow)
    updateList(newList)
  }

  // ==================== 动态渲染单元格 ====================
  const renderCell = (
    record: TableRowItem,
    rowIdx: number,
    col: TableColumnConfig,
  ) => {
    const val = record[col.dataIndex]
    const disabled = !record._isGroupFirst && col.merge

    switch (col.type) {
      case 'upload':
        return (
          <Upload
            listType="picture-card"
            fileList={val || []}
            action="#"
            disabled={disabled}
          >
            <PlusOutlined />
          </Upload>
        )
      case 'select':
        return (
          <Select
            value={val}
            disabled={disabled}
            placeholder="请选择"
            style={{ width: '100%' }}
            onChange={(v) => {
              tableList[rowIdx][col.dataIndex] = v
              updateList(tableList)
            }}
          >
            {col.options?.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        )
      case 'monthRange':
        return (
          <RangePicker
            value={val ? [dayjs(val[0]), dayjs(val[1])] : undefined}
            picker="month"
            format="YYYY-MM"
            style={{ width: '100%' }}
            onChange={(dates: any) =>
              handleDateChange(rowIdx, record, col, dates)
            }
          />
        )
      case 'dateRange':
        return (
          <RangePicker
            value={val ? [dayjs(val[0]), dayjs(val[1])] : undefined}
            format="YYYY-MM-DD"
            style={{ width: '100%' }}
            onChange={(dates: any) =>
              handleDateChange(rowIdx, record, col, dates)
            }
          />
        )
      case 'readonly':
        return <Input value={val} readOnly bordered={false} />
      default:
        return (
          <Input
            value={val}
            placeholder="请输入"
            onChange={(e) => {
              tableList[rowIdx][col.dataIndex] = e.target.value
              updateList(tableList)
            }}
          />
        )
    }
  }

  // ==================== 组装最终Table列 ====================
  const renderColumns = useMemo(() => {
    const tableCols: any[] = columns.map((col, colIdx) => ({
      title: col.title,
      dataIndex: col.dataIndex,
      width: col.width,
      onCell: (record: TableRowItem, rowIdx: number) =>
        cellSpan(record, col, rowIdx, colIdx),
      render: (_: any, record: TableRowItem, rowIdx: number) =>
        renderCell(record, rowIdx, col),
    }))

    // 操作列（A/B 两列分组：A=删除复制不合并，B=增加按钮按分组合并）
    if (showOperate) {
      const colAWidth = operateWidth * 0.65
      const colBWidth = operateWidth * 0.35

      tableCols.push({
        title: '操作',
        children: [
          {
            // A列：删除 + 复制，不合并，每行独立
            width: colAWidth,
            render: (_: any, _record: TableRowItem, rowIdx: number) => (
              <>
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(rowIdx)}
                />
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(rowIdx)}
                  style={{ marginLeft: 4 }}
                />
              </>
            ),
          },
          {
            // B列：增加按钮，按分组合并（同组多行只显示一个）
            width: colBWidth,
            onCell: (record: TableRowItem, rowIdx: number) => {
              const groupStartIdx = tableList.findIndex(
                (item) => item._groupId === record._groupId,
              )
              if (rowIdx === groupStartIdx) {
                const groupRows = tableList.filter(
                  (item) => item._groupId === record._groupId,
                )
                return { rowSpan: groupRows.length, colSpan: 1 }
              }
              return { rowSpan: 0, colSpan: 0 }
            },
            render: (_: any, record: TableRowItem) => (
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => handleAddSameGroupRow(record)}
              />
            ),
          },
        ],
      })
    }
    return tableCols
  }, [columns, tableList])

  return (
    <div className="group-multi-table">
      <Table
        bordered
        rowKey="_groupId"
        dataSource={tableList}
        columns={renderColumns}
        pagination={false}
      />
    </div>
  )
}

export default GroupMultiTable
