// 分组多行表格组件演示页面

import GroupMultiTable from '@/components/GroupMultiTable'
import type {
  TableColumnConfig,
  TableRowItem,
} from '@/components/GroupMultiTable/type.d'
import { PageContainer } from '@ant-design/pro-components'
import { Card, Space, Typography } from 'antd'
import React, { useMemo, useState } from 'react'

const { Text, Paragraph } = Typography

const GroupMultiTableDemo: React.FC = () => {
  const [groupTableData, setGroupTableData] = useState<TableRowItem[]>([
    {
      _groupId: 'group-1',
      _isGroupFirst: true,
      name: '张三',
      monthRange: ['2024-01', '2024-06'],
      monthCount: 6,
      role: 'admin',
      remark: '第一组',
    },
    {
      _groupId: 'group-1',
      _isGroupFirst: false,
      name: '张三',
      monthRange: ['2024-07', '2024-12'],
      monthCount: 6,
      role: 'admin',
      remark: '第二行',
    },
    {
      _groupId: 'group-2',
      _isGroupFirst: true,
      name: '李四',
      monthRange: ['2024-03', '2024-08'],
      monthCount: 6,
      role: 'editor',
      remark: '',
    },
  ])

  const groupTableColumns: TableColumnConfig[] = useMemo(
    () => [
      {
        title: '姓名',
        dataIndex: 'name',
        width: 100,
        merge: true,
      },
      {
        title: '角色',
        dataIndex: 'role',
        width: 100,
        merge: true,
        type: 'select',
        options: [
          { label: '管理员', value: 'admin' },
          { label: '编辑者', value: 'editor' },
          { label: '访客', value: 'viewer' },
        ],
      },
      {
        title: '月份范围',
        dataIndex: 'monthRange',
        width: 200,
        type: 'monthRange',
        calcMonthTarget: 'monthCount',
      },
      {
        title: '月份数',
        dataIndex: 'monthCount',
        width: 80,
        type: 'readonly',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: 150,
      },
    ],
    [],
  )

  return (
    <PageContainer
      header={{
        title: '分组多行表格演示',
        breadcrumb: {},
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            支持按字段分组合并行、多种单元格类型（input / select / monthRange /
            dateRange / upload / readonly）、自动计算月份数、行内增删复制操作。
            同一 <Text code>_groupId</Text> 的行视为一组，首行通过{' '}
            <Text code>merge: true</Text> 的列会自动跨行合并。
          </Paragraph>
          <GroupMultiTable
            columns={groupTableColumns}
            value={groupTableData}
            groupKey="name"
            onChange={setGroupTableData}
          />
        </Card>
      </Space>
    </PageContainer>
  )
}

export default GroupMultiTableDemo
