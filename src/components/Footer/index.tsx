import { DefaultFooter } from '@ant-design/pro-layout'
import { APP_NAME } from '@/constants'

export default () => {
  const currentYear = new Date().getFullYear()

  return (
    <DefaultFooter
      copyright={`${currentYear} ${APP_NAME}`}
      links={[
        {
          key: 'Ant Design',
          title: 'Ant Design',
          href: 'https://ant.design',
          blankTarget: true,
        },
        {
          key: 'UmiJS',
          title: 'UmiJS Max',
          href: 'https://umijs.org',
          blankTarget: true,
        },
      ]}
    />
  )
}
